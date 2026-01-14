/*
 * Logger Service Module
 * This module initializes the Pino logger and provides a utility function
 * to persist application logs into the MongoDB database.
 */

const pino = require("pino");
const Log = require("../models/log");

// Create Pino logger for logs-service
const logger = pino({
  level: "info",
});

/*
 * Save Log to MongoDB
 * Asynchronously validates input and saves a log entry to the database.
 * Checks for active DB connection before attempting creation.
 */
const saveLogToMongoDB = async (logData) => {
  try {
    // Convert userid to number, default to 0 if not a valid number
    const userid = Number(logData.userid) || 0;

    // Only attempt to save if database connection is active
    if (!require("mongoose").connection.db) {
      return; // Database not connected, skip logging
    }

    await Log.create({
      userid: userid,
      action: logData.action,
      details: logData.details || {},
    });
  } catch (error) {
    // Silently handle logging errors to prevent test suite interruption
    // Only log if it's not a connection error
    if (
      !error.message.includes("closed connection") &&
      !error.message.includes("connection")
    ) {
      // Uncomment for debugging: console.error("Error saving log to MongoDB:", error.message);
    }
  }
};

module.exports = { logger, saveLogToMongoDB };