const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Log schema for storing system logs
const LogsSchema = new Schema({
  userid: {
    type: Number,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: String,
  },
});

const Log = mongoose.model("logs", LogsSchema);

module.exports = Log;
