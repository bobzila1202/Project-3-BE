const express = require('express');
const cors = require('cors');

const Router = require('./routers/game');

const api = express();

api.use(cors());
api.use(express.json());

api.get("/", (req, res) => {
    res.json({
        title: "The deadly robot game",
        description: "Inspired by darkest dungeon!"
    })
})

api.use("/index", Router);

module.exports = api;