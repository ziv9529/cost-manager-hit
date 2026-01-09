const { mongoose } = require("../database/mongoose");
const Schema = mongoose.Schema;

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
