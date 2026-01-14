/*
 * User Model Module
 * This module defines a minimal Mongoose schema and model for users.
 * It maps to the 'users' collection in the MongoDB database.
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
 * User Schema Definition
 * Defines the core structure for user documents, ensuring essential
 * personal information like ID, name(first and last), and birthday.
 */
const UserSchema = new Schema(
  {
    // Unique identifier for user
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    // User's first name
    first_name: {
      type: String,
      required: true,
    },
    // User's last name
    last_name: {
      type: String,
      required: true,
    },
    // User's birthday date
    birthday: {
      type: Date,
      required: true,
    },
  },
  // Disable the version key (__v) for cleaner documents
  { versionKey: false }
);

// Create the model from the schema
const User = mongoose.model("users", UserSchema);

module.exports = User;
