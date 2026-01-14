/*
 * Database Connection Module
 * This module manages the connection to the MongoDB database using Mongoose.
 * It implements a singleton-like pattern to prevent multiple connection attempts.
 */

const mongoose = require("mongoose");

// MongoDB connection flag
let isConnected = false;

/*
 * Establish Database Connection
 * Asynchronously connects to MongoDB if not already connected.
 * Returns the mongoose instance.
 */
const connectDB = async (uri) => {
  // Check if connection is already established to reuse it
  if (isConnected) {
    return mongoose;
  }

  try {
    // Attempt to connect to MongoDB with the provided URI
    await mongoose.connect(uri);
    isConnected = true;
    return mongoose;
  } catch (err) {
    // Connection failure and rethrow error for caller handling
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
};

module.exports = { mongoose, connectDB };
