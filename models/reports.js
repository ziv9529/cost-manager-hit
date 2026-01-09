const { mongoose } = require("../database/mongoose");
const Schema = mongoose.Schema;

// Schema for storing computed monthly reports (Computed Design Pattern)
const ReportsSchema = new Schema({
  userid: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  costs: {
    type: Array,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for efficient lookups by userid, year, and month
ReportsSchema.index({ userid: 1, year: 1, month: 1 }, { unique: true });

const Report = mongoose.model("reports", ReportsSchema);

module.exports = Report;
