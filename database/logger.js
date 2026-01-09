const pino = require("pino");
const Log = require("../models/logs");

// Create Pino logger
const logger = pino({
  level: "info",
});

// Function to save log to MongoDB
const saveLogToMongoDB = async (logData) => {
  try {
    await Log.create({
      userid: logData.userid || 0,
      action: logData.action || "Unknown action",
      timestamp: new Date(),
      details: JSON.stringify(logData.details || {}),
    });
  } catch (error) {
    console.error("Error saving log to MongoDB:", error.message);
  }
};

module.exports = { logger, saveLogToMongoDB };
