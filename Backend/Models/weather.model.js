const mongoose = require("mongoose");

const schema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    temperature: {
        type: Number,
        required: true,
    },
    humidity: {
        type: Number,
        required: true,
    },
    windSpeed: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },
});

const weather = mongoose.model("weather", schema);

module.exports = { weather };
