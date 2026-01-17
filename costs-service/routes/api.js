/*
 * API Router Module
 * This module defines the public API endpoints for the application.
 */

const express = require("express");
const router = express.Router();

// Import database models for the application
const Cost = require("../models/cost");
const User = require("../models/user");
const Report = require("../models/report");

// Internal Error Codes
const errorCodes = {
  missingParameters: 100,
  invalidSum: 101,
  pastDateNotAllowed: 102,
  invalidMonthRange: 103,
  sameDayRequiresTime: 104,
  userNotFound: 404,
  serverInternalError: 500,
};

/*
 * POST /add
 * Creates a new cost entry for a user.
 * Returns the created cost object.
 */
router.post("/add", function (req, res) {
  // Extract all parameters from the request body
  const { description, category, userid, sum, date } = req.body;

  // Validation: Check if any required field is missing from the request body
  if (!description || !category || !userid || !sum) {
    // Return error if parameters are missing
    return res.status(400).json({
      id: errorCodes.missingParameters,
      message:
        "Missing some required parameters (description, category, userid, sum)",
    });
  }

  // Validation: Ensure the 'sum' parameter is not a negative number
  if (sum < 0) {
    // Return error for negative value
    return res.status(400).json({
      id: errorCodes.invalidSum,
      message: "Sum can't be negative number",
    });
  }

  // Get the current date and time
  const nowDate = new Date();
  let costDate;

  // Check if the user provided a specific date/time in the request
  // If a date is provided, validate and use it; otherwise, default to the current date and time
  if (date) {
    // Parse the provided date (can be "2026-01-16" or "2026-01-16T12:00:00")
    costDate = new Date(date);

    // Reject the request if the date/time is in the past
    if (costDate < nowDate) {
      // Check if the provided date is today (just missing the time component)
      const providedDay = new Date(date);
      const todayDay = new Date();
      const isSameDay =
        providedDay.getFullYear() === todayDay.getFullYear() &&
        providedDay.getMonth() === todayDay.getMonth() &&
        providedDay.getDate() === todayDay.getDate();

      // If it's today's date without a future time, give a specific error message
      if (isSameDay) {
        return res.status(400).json({
          id: errorCodes.sameDayRequiresTime,
          message:
            "Same-day costs require a future time (format: '2026-01-16T18:00:00')",
        });
      }

      // Otherwise, it's a past date (previous day or earlier)
      return res.status(400).json({
        id: errorCodes.pastDateNotAllowed,
        message: "Can't add cost with a past date",
      });
    }
  } else {
    // No date provided, use current date and time as default (now)
    costDate = nowDate;
  }

  // Query the database to verify that the user exists before adding the cost
  User.findOne({ id: userid })
    .then((userExists) => {
      // If the user is not found, throw an error to skip to the catch block
      if (!userExists) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.errorCode = errorCodes.userNotFound;
        throw error;
      }

      // If user exists, Create a new cost document in the database with the validated date
      return Cost.create({
        description,
        category,
        userid,
        sum,
        date: costDate,
      });
    })
    .then((cost) => {
      // If creation is successful, send the created cost object back to the client
      // Convert to plain object and exclude _id field
      const costObj = cost.toObject();
      delete costObj._id;
      res.status(200).send(costObj);
    })
    .catch((error) => {
      // Catch any errors (user find failed or others) and return appropriate status
      const statusCode = error.statusCode || 500;
      const errorCode = error.errorCode || errorCodes.serverInternalError;
      res.status(statusCode).json({ id: errorCode, message: error.message });
    });
});

/*
 * COMPUTED DESIGN PATTERN IMPLEMENTATION FOR MONTHLY REPORTS
 *
 * This endpoint implements the Computed Design Pattern for generating monthly cost reports.
 * The pattern optimizes performance by caching computed reports for past months.
 *
 * How it works:
 * 1. When a report is requested for a PAST month:
 *    - First check if a pre-computed report exists in the reports collection
 *    - If found, return the cached report immediately (fast response)
 *    - If not found, compute the report, save it to reports collection, then return it
 *    - Future requests for the same past month will use the cached version
 *
 * 2. When a report is requested for CURRENT or FUTURE month:
 *    - Always compute the report in real-time (never cache)
 *    - This ensures the report reflects any new costs added in the current month
 *
 * Benefits:
 * - Fast retrieval for historical data (cached reports)
 * - Always accurate for current month (real-time computation)
 * - Reduced database load for frequently requested past months
 * - No stale data issues since past months cannot have new costs added
 *
 * The computed report groups all costs by category and formats them according to
 * the specification, ensuring all 5 categories are present even if empty.
 */
/*
 * GET /report
 * Retrieve monthly report of costs for a user (with caching for past months)
 * Returns the requested report.
 */
router.get("/report", function (req, res) {
  // Extract query parameters: id, year, and month
  const { id, year, month } = req.query;

  // Validation: Check if any required parameter is missing
  if (!id || !year || !month) {
    return res.status(400).json({
      id: errorCodes.missingParameters,
      message: "Missing required parameters (id, year, month)",
    });
  }

  // Convert parameters to numbers for comparison and database queries
  const userid = Number(id);
  const requestYear = Number(year);
  const requestMonth = Number(month);

  // Validation: Ensure month is between 1-12
  if (requestMonth < 1 || requestMonth > 12) {
    return res.status(400).json({
      id: errorCodes.invalidMonthRange,
      message: "Month must be between 1 and 12",
    });
  }

  // Get current date to determine if requested month is in the past
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

  // Validation: Check if the user exists in the database
  User.findOne({ id: userid })
    .then((userExists) => {
      // If the user is not found, throw an error
      if (!userExists) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.errorCode = errorCodes.userNotFound;
        throw error;
      }

      // Check if the requested month is in the past
      const isPastMonth =
        requestYear < currentYear ||
        (requestYear === currentYear && requestMonth < currentMonth);

      /*
       * If the requested month is in the PAST, check if we have a cached report.
       * This implements the Computed Design Pattern - we only cache past months
       * because they cannot have new costs added (server prevents past dates).
       */
      if (isPastMonth) {
        // Try to find an existing cached report for this user, year, and month
        return Report.findOne({
          userid: userid,
          year: requestYear,
          month: requestMonth,
        }).then((existingReport) => {
          // If cached report exists, return it immediately
          if (existingReport) {
            return res.status(200).json({
              userid: existingReport.userid,
              year: existingReport.year,
              month: existingReport.month,
              costs: existingReport.costs,
            });
          }

          // No cached report found, compute it and save for future requests
          return compute(userid, requestYear, requestMonth, res, true);
        });
      } else {
        /*
         * For CURRENT or FUTURE months, always compute in real-time.
         * We don't cache these because costs can still be added to current/future months.
         */
        compute(userid, requestYear, requestMonth, res, false);
      }
    })
    .catch((error) => {
      // Handle database errors or user not found
      const statusCode = error.statusCode || 500;
      const errorCode = error.errorCode || errorCodes.serverInternalError;
      res.status(statusCode).json({ id: errorCode, message: error.message });
    });
});

/*
 * Helper function to compute a monthly report.
 * This function queries all costs for the specified user, year, and month,
 * then groups them by category and formats the response.
 *
 * @param {number} userid - The user ID
 * @param {number} year - The year for the report
 * @param {number} month - The month for the report
 * @param {object} res - The HTTP response object
 * @param {boolean} shouldSave - Whether to save the computed report to the database
 */
function compute(userid, year, month, res, shouldSave = false) {
  // Create date range for the requested month
  // Month in JavaScript Date is 0-indexed, so subtract 1
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month

  // Query all costs for this user within the specified month
  Cost.find({
    userid: userid,
    date: { $gte: startDate, $lte: endDate },
  })
    .then((costs) => {
      // Format the costs into the required response structure
      const formattedReport = formatReport(userid, year, month, costs);

      // If shouldSave is true, save the computed report to the reports collection
      if (shouldSave) {
        return Report.create({
          userid: userid,
          year: year,
          month: month,
          costs: formattedReport.costs,
        }).then(() => {
          // Return the computed report to the client
          res.status(200).json(formattedReport);
        });
      } else {
        // Just return the report without saving
        res.status(200).json(formattedReport);
      }
    })
    .catch((error) => {
      // Handle database errors (query or save)
      res
        .status(500)
        .json({ id: errorCodes.serverInternalError, message: error.message });
    });
}

/*
 * Helper function to format costs into the required report structure.
 * Groups costs by category and ensures all 5 standard categories are present,
 * plus any additional custom categories found in the costs data.
 */
function formatReport(userid, year, month, costs) {
  // Standard categories that must always be included
  const standardCategories = [
    "food",
    "health",
    "housing",
    "sports",
    "education",
  ];

  // Initialize an object to group costs by category
  const categorizedCosts = {};

  // Initialize all standard categories with empty arrays
  standardCategories.forEach((cat) => {
    categorizedCosts[cat] = [];
  });

  // Group each cost by its category
  costs.forEach((cost) => {
    // Initialize the category array if it doesn't exist (for custom categories)
    if (!categorizedCosts[cost.category]) {
      categorizedCosts[cost.category] = [];
    }

    // Extract the day of the month from the cost date
    const day = cost.date.getDate();

    // Add the cost to the appropriate category array
    categorizedCosts[cost.category].push({
      sum: cost.sum,
      description: cost.description,
      day: day,
    });
  });

  // Format the response to match the required structure
  // First, add all standard categories in order
  const formattedCosts = standardCategories.map((cat) => ({
    [cat]: categorizedCosts[cat],
  }));

  // Then, add any additional custom categories (those not in standard list)
  Object.keys(categorizedCosts).forEach((cat) => {
    if (!standardCategories.includes(cat)) {
      formattedCosts.push({
        [cat]: categorizedCosts[cat],
      });
    }
  });

  // Return the formatted report object
  return {
    userid: userid,
    year: year,
    month: month,
    costs: formattedCosts,
  };
}

module.exports = router;
