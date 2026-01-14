/*
 * API Router Module
 * This module defines the public API endpoints for the application.
 */

const express = require("express");
const router = express.Router();

/*
 * GET /about
 * Retrieves information about the development team.
 * Returns a JSON array containing developers names.
 */
router.get("/about", function (req, res) {
  try {
    // Define the developers team array with first and last names in JSON format
    const developersTeam = [
      {
        // First Developer details
        first_name: "Lior",
        last_name: "Halaby",
      },
      {
        // Second Developer details
        first_name: "Ziv",
        last_name: "Ashkenazi",
      },
    ];
    // Send the team data as a JSON response with 200 OK status
    res.status(200).send(developersTeam);
  } catch (error) {
    // Catch any errors during processing and return a 500 Internal Server Error
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
