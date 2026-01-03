const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CostsSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['food', 'health', 'housing', 'sports', 'education']
    },
    userid: {
        type: Number,
        required: true
    },
    sum: {
        type: Schema.Types.Double,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Cost = mongoose.model('costs',CostsSchema);

module.exports = Cost;