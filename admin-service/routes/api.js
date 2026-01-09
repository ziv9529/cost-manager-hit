const express = require("express");
const router = express.Router();

// Retrieve developer team information
router.get("/about", function (req, res) {
  try {
    // Create the developers team (first + last name) in the JSON format
    const developersTeam = [
      {
        // First Developer
        first_name: "Lior",
        last_name: "Halaby",
      },
      {
        // Second Developer
        first_name: "Ziv",
        last_name: "Ashkenazi",
      },
    ];
    res.status(200).send(developersTeam);
  } catch (error) {
    // Catch any errors and return a 500 error
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
