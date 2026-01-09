const express = require("express");
const router = express.Router();

const Log = require("../models/log");

// Retrieve all system logs
router.get("/logs", function (req, res) {
  try {
    // Query the database to get all logs
    Log.find({})
      .then((logs) => {
        // Send the list of logs back to the client
        res.status(200).send(logs);
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

module.exports = router;
