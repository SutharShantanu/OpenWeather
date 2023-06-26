const express = require("express");
const axios = require("axios");
const cities = require("../Models/cities.model");

const weatherRouter = express.Router();

weatherRouter.get("/", (req, res) => {
    res.send("Welcome to the weather application!");
});

const apiKey = "a48c0fc9d509efeebac0377dcb785b10";

weatherRouter.get("/search/:location", (req, res) => {
    const { location } = req.params;

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;
    const headers = {
        Authorization: "Bearer " + apiKey,
    };

    axios
        .get(apiUrl, headers)
        .then((response) => {
            const weatherData = response.data;
            res.status(200).send(weatherData);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("Internal server error");
        });
});

weatherRouter.get("/cities", async (req, res) => {
    try {
        const data = await cities.find({});
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(400).send("Internal server error", error);
    }
});

module.exports = { weatherRouter };
