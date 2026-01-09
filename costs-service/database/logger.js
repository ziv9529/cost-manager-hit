const pino = require("pino");

// Create Pino logger for costs-service
const logger = pino({
  level: "info",
});

// Function to save log to MongoDB (optional)
const saveLogToMongoDB = async (logData) => {
  // Logs are handled by the logging middleware
  // This is kept for consistency across services
};

module.exports = { logger, saveLogToMongoDB };
