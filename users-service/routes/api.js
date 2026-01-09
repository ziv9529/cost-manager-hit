const express = require("express");
const router = express.Router();

const User = require("../../models/users");
const Cost = require("../../models/costs");

router.post("/add", function (req, res) {
  // Extract all parameters from the request body
  const { id, first_name, last_name, birthday } = req.body;

  // Validation: Check if any required field is missing from the request body
  if (!id || !first_name || !last_name || !birthday) {
    return res.status(500).json({
      id: id,
      message:
        "Missing some required parameters (id, first_name, last_name, birthday)",
    });
  }

  const userBirthday = new Date(birthday);

  // Validation: Ensure the birthday is not in the future
  if (userBirthday > new Date()) {
    return res
      .status(500)
      .json({ id: id, message: "Birthday date can't be in the future" });
  }

  // Query the database to verify that the user doesn't already exist
  User.findOne({ id: id })
    .then((userExists) => {
      // If the user is found, throw an error to skip to the catch block
      if (userExists) {
        throw new Error("User already exists");
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
      res.status(200).send(user);
    })
    .catch((error) => {
      // Catch any errors (user find failed or others) and return a 500 error
      res.status(500).json({ id: id, message: error.message });
    });
});

router.get("/users", function (req, res) {
  try {
    // Query the database to get all users
    User.find({})
      .then((users) => {
        // Send the list of users back to the client
        res.status(200).send(users);
      })
      .catch((error) => {
        // Catch any errors and return a 500 error
        res.status(500).json({ message: error.message });
      });
  } catch (error) {
    // Catch any errors and return a 500 error
    res.status(500).json({ message: error.message });
  }
});

router.get("/users/:id", function (req, res) {
  // Extract the user ID from the URL parameters
  const { id } = req.params;

  /*
   * COMPUTED DESIGN PATTERN IMPLEMENTATION
   *
   * This endpoint implements the Computed Design Pattern for calculating user's total costs.
   * Instead of storing the total cost sum in the users collection (which would create data
   * redundancy and require updates every time a cost is added), we compute the total on-demand
   * when requested.
   *
   * The pattern works as follows:
   * 1. First, we retrieve the user document from the users collection
   * 2. Then, we use MongoDB aggregation pipeline to calculate the sum of all costs for this user
   * 3. The aggregation uses $match to filter costs by userid and $group with $sum to calculate total
   * 4. The computed total is returned in the response along with user details
   *
   * Benefits:
   * - No data duplication: total is not stored, eliminating sync issues
   * - Always accurate: total is calculated in real-time from actual cost documents
   * - Simpler updates: adding/removing costs doesn't require updating user documents
   *
   * This approach is optimal for scenarios where reads are less frequent than writes,
   * and when real-time accuracy is more important than read performance.
   */

  // Query the database to find the user by ID
  User.findOne({ id: id })
    .then((user) => {
      // If the user is not found, throw an error to skip to the catch block
      if (!user) {
        throw new Error("User not found");
      }

      // Query the database to calculate the total costs for this user using aggregation
      return Cost.aggregate([
        { $match: { userid: Number(id) } }, // Filter costs by userid
        { $group: { _id: null, total: { $sum: "$sum" } } }, // Sum all cost amounts
      ]).then((result) => {
        // Calculate the total costs, default to 0 if no costs found
        const total = result.length > 0 ? result[0].total : 0;

        // Send the user details with computed total costs back to the client
        res.status(200).json({
          first_name: user.first_name,
          last_name: user.last_name,
          id: user.id,
          total: total,
        });
      });
    })
    .catch((error) => {
      // Catch any errors and return a 500 error with id and message
      res.status(500).json({ id: id, message: error.message });
    });
});

module.exports = router;
