const express = require("express");
const axios = require("axios");

const weatherRouter = express.Router();

weatherRouter.get("/", (req, res) => {
    res.send("Welcome to the weather application!");
});

// weatherRouter.get("/search/:location", (req, res) => {
//     const { location } = req.params;

//     const apiUrl = `https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?city=${location}`;
//     const options = {
//         headers: {
//             "X-RapidAPI-Key":
//                 "58acf53baemsh60d1d18093b8761p1988f9jsnfa120d9838a9",
//         },
//     };

//     axios
//         .get(apiUrl, options)
//         .then((response) => {
//             const weatherData = response.data;
//             res.status(200).send(weatherData);
//         })
//         .catch((error) => {
//             console.error(error);
//             res.status(500).send("Internal server error");
//         });
// });

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

module.exports = { weatherRouter };
