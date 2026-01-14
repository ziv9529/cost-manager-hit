/*
 * Costs Service Application Module
 * Initializes the Express application, configures middleware,
 * connects to the database, and sets up error handling.
 */

// Import necessary modules for the application
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

// Import database connection and logging utilities from local modules
const { connectDB } = require("./database/mongoose");
const { saveLogToMongoDB } = require("./database/logger");

// Load environment variables from .env file
require("dotenv").config();

// Import the API router handles
const apiRouter = require("./routes/api");

// Initialize the Express application
const app = express();

/*
 * Establishes a connection to the MongoDB database.
 * Uses the connection string from environment variables.
 * Exits the process if the connection fails.
 */
const connectDatabase = async () => {
  try {
    // Attempt to connect to the database using the URI from .env file
    await connectDB(process.env.MONGODB_URI);
  } catch (err) {
    // Log the error message if the connection fails
    console.error(
      "\x1b[32m[COSTS-SERVICE]\x1b[0m MongoDB connection error:",
      err.message
    );
    // Exit the process with an error code
    process.exit(1);
  }
};

// Configure the view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

/*
* Pino logging middleware - save to MongoDB
* Captures start time and logs details upon response finish
*/
app.use((req, res, next) => {
  // Capture the start time of the request to calculate duration later
  const startTime = Date.now();

  // Listen for the 'finish' event to log after response is sent
  res.on("finish", () => {
    saveLogToMongoDB({
      // Extract user ID from body or params, defaulting to 0 if not present
      userid: req.body?.userid || req.params?.id || 0,
      action: `${req.method} ${req.originalUrl}`,
      // Log specific request details
      details: {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: Date.now() - startTime,
      },
    });
  });

  // Proceed to the next middleware in the stack
  next();
});

// Standard Express middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie-parser middleware for parsing cookies
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Mount the API router under the '/api' path prefix
app.use("/api", apiRouter);

/*
 * 404 Error Handler Middleware.
 * Catches any requests that didn't match previous routes and forwards a 404 error.
 */
app.use(function (req, res, next) {
  next(createError(404));
});

/*
 * Global Error Handler Middleware.
 * Renders the error page and passes error details to the view.
 */
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Set the response status code (default to 500 if unknown)
  res.status(err.status || 500);
  // Render the error page
  res.render("error");
});

// Export the app and the database connection function for external use
module.exports = { app, connectDB: connectDatabase };
