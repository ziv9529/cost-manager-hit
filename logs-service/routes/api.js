/*
 * API Router Module
 * This module defines the public API endpoints for the application.
 */

const express = require("express");
const router = express.Router();

// Import database models for the application
const Log = require("../models/log");

// Internal Error Codes
const errorCodes = {
  serverInternalError: 500,
};

/*
 * GET /logs
 * Retrieve all system logs.
 * Returns a JSON array containing all logs documents.
 */
router.get("/logs", function (req, res) {
  // Use the Log model to find all documents in the logs collection
  Log.find({})
    .then((logs) => {
      // Successfully retrieved all logs, send them back with a 200 OK status
      res.status(200).send(logs);
    })
    .catch((error) => {
      // If an error occurs during the database query, return a 500 Internal Server Error
      res
        .status(500)
        .json({ id: errorCodes.serverInternalError, message: error.message });
    });
});

module.exports = router;
