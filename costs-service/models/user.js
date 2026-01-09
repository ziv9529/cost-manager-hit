const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// User schema for costs-service (minimal, for validation only)
const UserSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
});

const User = mongoose.model("users", UserSchema);

module.exports = User;
