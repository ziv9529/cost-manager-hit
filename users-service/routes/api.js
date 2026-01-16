/*
 * API Router Module
 * This module defines the public API endpoints for the application.
 */

const express = require("express");
const router = express.Router();

// Import the User model for database operations
const User = require("../models/user");

// Import the Cost model to calculate total costs for users
const Cost = require("../../costs-service/models/cost");

// Internal Error Codes
const errorCodes = {
  missingParameters: 100,
  userNotFound: 404,
  userAlreadyExists: 409,
  invalidBirthday: 105,
  serverInternalError: 500,
};

/*
 * POST /add
 * Creates a new user in the system after validating the input data.
 * Returns the created user object (excluding internal MongoDB IDs).
 */
router.post("/add", function (req, res) {
  // Extract all parameters from the request body
  const { id, first_name, last_name, birthday } = req.body;

  // Validation: Check if any required field is missing from the request body
  if (!id || !first_name || !last_name || !birthday) {
    return res.status(400).json({
      id: errorCodes.missingParameters,
      message:
        "Missing some required parameters (id, first_name, last_name, birthday)",
    });
  }

  // Convert the birthday string to a Date object for comparison
  const userBirthday = new Date(birthday);

  // Validation: Ensure the birthday is not in the future
  if (userBirthday > new Date()) {
    return res.status(400).json({
      id: errorCodes.invalidBirthday,
      message: "Birthday date can't be in the future",
    });
  }

  // Query the database to verify that the user doesn't already exist
  User.findOne({ id: id })
    .then((userExists) => {
      // If the user is found, throw an error to skip to the catch block
      if (userExists) {
        const error = new Error("User already exists");
        error.statusCode = 409;
        error.errorCode = errorCodes.userAlreadyExists;
        throw error;
      }

      // Create a new user document in the database
      return User.create({
        id,
        first_name,
        last_name,
        birthday: userBirthday,
      });
    })
    .then((user) => {
      // If creation is successful, send the created user object back to the client
      // Convert to plain object and exclude _id field
      const userObj = user.toObject();
      delete userObj._id;
      res.status(200).send(userObj);
    })
    .catch((error) => {
      // Catch any errors (user find failed or others) and return appropriate status
      const statusCode = error.statusCode || 500;
      const errorCode = error.errorCode || errorCodes.serverInternalError;
      res.status(statusCode).json({ id: errorCode, message: error.message });
    });
});

/*
 * GET /users
 * Retrieves a list of all registered users.
 * Returns a JSON array of all users.
 */
router.get("/users", function (req, res) {
  try {
    // Query the database to get all users
    User.find({})
      .then((users) => {
        // Send the list of users back to the client (exclude _id field)
        const usersWithoutId = users.map((user) => {
          const userObj = user.toObject();
          delete userObj._id;
          return userObj;
        });
        res.status(200).send(usersWithoutId);
      })
      .catch((error) => {
        // Catch any errors and return a 500 error
        res
          .status(500)
          .json({ id: errorCodes.serverInternalError, message: error.message });
      });
  } catch (error) {
    // Catch any errors and return a 500 error
    res
      .status(500)
      .json({ id: errorCodes.serverInternalError, message: error.message });
  }
});

/*
 * GET /users/:id
 * Retrieves details for a specific user based on their ID.
 * Returns the user's personal information including total costs if found.
 */
router.get("/users/:id", function (req, res) {
  // Extract the user ID from the URL parameters
  const { id } = req.params;

  // Query the database to find the user by ID
  User.findOne({ id: id })
    .then((user) => {
      // If the user is not found, throw an error to skip to the catch block
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.errorCode = errorCodes.userNotFound;
        throw error;
      }

      // Calculate total costs for the user by summing all costs with this user ID
      return Cost.aggregate([
        { $match: { userid: parseInt(id) } },
        { $group: { _id: null, total: { $sum: "$sum" } } },
      ]).then((result) => {
        const total = result.length > 0 ? result[0].total : 0;

        // Send the user details back to the client including total costs
        res.status(200).json({
          first_name: user.first_name,
          last_name: user.last_name,
          id: user.id,
          total: total,
        });
      });
    })
    .catch((error) => {
      // Catch any errors and return appropriate status code with id and message
      const statusCode = error.statusCode || 500;
      const errorCode = error.errorCode || errorCodes.serverInternalError;
      res.status(statusCode).json({ id: errorCode, message: error.message });
    });
});

module.exports = router;
