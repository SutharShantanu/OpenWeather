const express = require("express");
const connection = require("./Configs/db");
const app = express();
var cors = require("cors");
const { weatherRouter } = require("./Routes/weather.route");

require("dotenv").config();
app.use(express.json());
app.use(cors());

app.get(`/`, (req, res) => {
    res.send({ msg: `Welcome to the OpenWeather` });
});
app.use("/weather", weatherRouter);

app.listen(process.env.port, async () => {
    await connection();
    console.log(`Server is running on Port ${process.env.port}`);
});
