const pino = require("pino");

// Create Pino logger for logs-service
const logger = pino({
  level: "info",
});

// Function to save log to MongoDB
const saveLogToMongoDB = async (logData) => {
  // Logs are handled by the logging middleware
};

module.exports = { logger, saveLogToMongoDB };
