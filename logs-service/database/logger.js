/*
 * Logger Service Module
 * This module initializes the Pino logger and provides a utility function
 * to persist application logs into the MongoDB database.
 */

const mongoose = require("mongoose");
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
    const mongoose = require("mongoose");
    // Only attempt to save if database connection is active and ready
    if (!mongoose.connection.db || mongoose.connection.readyState !== 1) {
      return; // Database not connected or not ready, skip logging
    }

    await Log.create({
      service: "logs-service",
      method: logData.method,
      url: logData.url,
      statusCode: logData.statusCode,
      responseTime: logData.responseTime,
    });
  } catch (error) {
    // Silently handle logging errors to prevent test suite interruption
    // Only log if it's not a connection or session error
    if (
      !error.message.includes("closed connection") &&
      !error.message.includes("connection") &&
      !error.message.includes("session that has ended")
    ) {
      console.error("Error saving log to MongoDB:", error.message);
    }
  }
};

module.exports = { logger, saveLogToMongoDB };
