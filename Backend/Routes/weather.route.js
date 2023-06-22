const express = require("express");
const axios = require("axios");

const weatherRouter = express.Router();

weatherRouter.get("/", (req, res) => {
  res.send("Welcome to the weather application!");
});

weatherRouter.get("/search/:location", (req, res) => {
  // Get the location from the request
  const { location } = req.params;

  // Make a request to the weather API
  const apiUrl = `https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?city=${location}`;
  const options = {
    headers: {
      "X-RapidAPI-Key": "58acf53baemsh60d1d18093b8761p1988f9jsnfa120d9838a9",
    },
  };

  // Make the request
  axios
    .get(apiUrl, options)
    .then((response) => {
      // Get the weather data from the response
      const weatherData = response.data;

      // Send the weather data to the client
      res.status(200).send(weatherData);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal server error");
    });
});

module.exports = { weatherRouter };
