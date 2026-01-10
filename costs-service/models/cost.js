const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Cost schema for managing expense information
const CostSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["food", "health", "housing", "sports", "education"],
    },
    userid: {
      type: Number,
      required: true,
    },
    sum: {
      type: Schema.Types.Double,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const Cost = mongoose.model("costs", CostSchema);

module.exports = Cost;
