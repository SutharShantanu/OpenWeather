const express = require("express");
const axios = require("axios");
const cities = require("../Models/cities.model");
require("dotenv").config();
const weatherRouter = express.Router();

weatherRouter.get("/", (req, res) => {
    res.send("Welcome to the weather application!");
});

const citiesToFetch = ["Delhi", "Kolkata", "Chennai", "Mumbai", "Bengaluru"];

const fetchAndSaveWeatherData = async () => {
    try {
        const fetchPromises = citiesToFetch.map((city) => {
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.apiKey}`;
            const headers = {
                Authorization: "Bearer " + process.env.apiKey,
            };

            return axios.get(apiUrl, { headers });
        });

        const responses = await Promise.all(fetchPromises);
        const weatherDataArray = responses.map((response) => response.data);
        await Promise.all(
            weatherDataArray.map((weatherData) =>
                cities.findOneAndUpdate(
                    { name: weatherData.name },
                    weatherData,
                    { upsert: true }
                )
            )
        );
        // console.log("Weather data for specific cities updated successfully!");
    } catch (error) {
        console.error(
            "Error updating weather data for specific cities:",
            error
        );
    }
};

weatherRouter.get("/search/:location", async (req, res) => {
    const { location } = req.params;

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.apiKey}`;
    const headers = {
        Authorization: "Bearer " + process.env.apiKey,
    };

    axios
        .get(apiUrl, headers)
        .then((response) => {
            const weatherData = response.data;
            res.status(200).send(weatherData);
        })
        .catch((error) => {
            res.status(500).send("Internal server error", error);
        });
    fetchAndSaveWeatherData();
});

weatherRouter.get("/cities", async (req, res) => {
    try {
        const data = await cities.find({});
        res.status(200).json(data);
    } catch (error) {
        res.status(400).send("Internal server error", error);
    }
});

module.exports = { weatherRouter };
