const pino = require("pino");

// Create Pino logger for admin-service
const logger = pino({
  level: "info",
});

// Function to save log to MongoDB (optional)
const saveLogToMongoDB = async (logData) => {
  // Logs are handled by the logging middleware
};

module.exports = { logger, saveLogToMongoDB };
