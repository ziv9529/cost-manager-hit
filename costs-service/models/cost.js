/*
 * Cost Model Module
 * This module defines the Mongoose schema and model for costs.
 * It maps to the 'costs' collection in the MongoDB database.
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
 * Cost Schema Definition
 * Defines the structure for cost documents including description, category,
 * user ID, sum, and the date of the expense.
 */
const CostSchema = new Schema(
  {
    // A brief description of the expense
    description: {
      type: String,
      required: true,
    },
    // The category of the cost, restricted to specific predefined values
    category: {
      type: String,
      required: true,
      enum: ["food", "health", "housing", "sports", "education"],
    },
    // The ID of the user who recorded the cost
    userid: {
      type: Number,
      required: true,
    },
    // The amount of money spent
    sum: {
      type: Number,
      required: true,
    },
    // The date the expense occurred (defaults to current time)
    date: {
      type: Date,
      default: Date.now,
    },
  },
  // Disable the version key (__v) for cleaner documents
  { versionKey: false }
);

// Create the model from the schema
const Cost = mongoose.model("costs", CostSchema);

module.exports = Cost;
