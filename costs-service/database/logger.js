const pino = require("pino");
const Log = require("../models/log");

// Create Pino logger for costs-service
const logger = pino({
  level: "info",
});

// Function to save log to MongoDB
const saveLogToMongoDB = async (logData) => {
  try {
    await Log.create({
      userid: logData.userid || 0,
      action: logData.action,
      details: JSON.stringify(logData.details || {}),
    });
  } catch (error) {
    console.error("Error saving log to MongoDB:", error.message);
  }
};

module.exports = { logger, saveLogToMongoDB };
