/*
 * Log Model Module
 * This module defines the Mongoose schema and model for system logs.
 * It maps to the 'logs' collection in the MongoDB database.
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
 * Log Schema Definition
 * Defines the structure for log documents including user ID, action,
 * timestamp, and additional details.
 */
const LogsSchema = new Schema(
  {
    // The ID of the user performing the action
    userid: {
      type: Number,
      required: true,
    },
    // A string description of the action performed
    action: {
      type: String,
      required: true,
    },
    // The time when the action occurred (defaults to current time)
    timestamp: {
      type: Date,
      default: Date.now,
    },
    // Flexible object to store additional details
    details: {
      type: Object,
    },
  },
  // Disable the version key (__v) for cleaner documents
  { versionKey: false }
);

// Create the model from the schema
const Log = mongoose.model("logs", LogsSchema);

module.exports = Log;
