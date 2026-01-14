/*
 * Report Model Module
 * This module defines the Mongoose schema and model for computed monthly reports.
 * It utilizes the Computed Design Pattern to store pre-calculated data.
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
 * Reports Schema Definition
 * Defines the structure for monthly summaries, including the user's ID,
 * the specific period (year/month), and the array of cost items.
 */
const ReportsSchema = new Schema({
  // The ID of the user the report belongs to
  userid: {
    type: Number,
    required: true,
  },
  // The specific year for this report
  year: {
    type: Number,
    required: true,
  },
  // The specific month for this report
  month: {
    type: Number,
    required: true,
  },
  // Array containing the costs data for the period
  costs: {
    type: Array,
    required: true,
  },
  // The timestamp when the report was generated
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for efficient lookups by userid, year, and month
ReportsSchema.index({ userid: 1, year: 1, month: 1 }, { unique: true });

// Create the model from the schema
const Report = mongoose.model("reports", ReportsSchema);

module.exports = Report;
