const { mongoose } = require("../database/mongoose");
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  id: {
    type: Number,
    required: true,
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
    default: Date.now,
  },
});

const User = mongoose.model("users", UsersSchema);

module.exports = User;
