const mongoose = require("mongoose");

// MongoDB connection flag
let isConnected = false;

// Connect to MongoDB
const connectDB = async (uri) => {
  if (isConnected) {
    return mongoose;
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    return mongoose;
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
};

module.exports = { mongoose, connectDB };
