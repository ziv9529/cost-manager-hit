/*
 * Index Router Module
 * This module defines the main entry route for the application (Homepage).
 */

const express = require("express");
const router = express.Router();

/*
 * GET /
 * Renders the home page of the application.
 * Passes the title variable to the view engine.
 */
router.get("/", function (req, res, next) {
  // Render the 'index' template and pass the title data
  res.render("index", { title: "Express" });
});

module.exports = router;
