const mongoose = require("mongoose");

const citiesSchema = new mongoose.Schema({
    coord: {
        lon: Number,
        lat: Number,
    },
    weather: [
        {
            id: Number,
            main: String,
            description: String,
            icon: String,
        },
    ],
    base: String,
    main: {
        temp: Number,
        feels_like: Number,
        temp_min: Number,
        temp_max: Number,
        pressure: Number,
        humidity: Number,
    },
    visibility: Number,
    wind: {
        speed: Number,
        deg: Number,
    },
    clouds: {
        all: Number,
    },
    dt: Number,
    // sys: {
    //     type: Number,
    //     id: Number,
    //     country: String,
    //     sunrise: Number,
    //     sunset: Number,
    // },
    timezone: Number,
    id: Number,
    name: String,
    cod: Number,
});

const cities = mongoose.model("citie", citiesSchema);

module.exports = cities;
