/*
 * Log Model Module
 * This module defines the Mongoose schema and model for system logs.
 * It maps to the 'logs' collection in the MongoDB database.
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
 * Log Schema Definition
 * Flattened structure for minimal and efficient log storage.
 * Stores user ID, service, HTTP method, URL, status, response time, and timestamp.
 */
const LogsSchema = new Schema(
  {
    // The service that created this log entry
    service: {
      type: String,
      required: true,
    },
    // HTTP method (GET, POST, PUT, DELETE, etc.)
    method: {
      type: String,
      required: true,
    },
    // The endpoint URL path
    url: {
      type: String,
      required: true,
    },
    // HTTP response status code
    statusCode: {
      type: Number,
      required: true,
    },
    // Response time in milliseconds
    responseTime: {
      type: Number,
    },
    // The time when the action occurred (defaults to current time)
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  // Disable the version key (__v) for cleaner documents
  { versionKey: false }
);

// Create the model from the schema
const Log = mongoose.model("logs", LogsSchema);

module.exports = Log;
