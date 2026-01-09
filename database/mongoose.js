const mongoose = require("mongoose");

// This will be the shared mongoose instance used by all models
let isConnected = false;

const connectDB = async (uri) => {
  if (isConnected) {
    return;
  }

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log("Shared MongoDB connection established");
  } catch (err) {
    console.error("Shared MongoDB connection error:", err.message);
    throw err;
  }
};

module.exports = { mongoose, connectDB, isConnected };
