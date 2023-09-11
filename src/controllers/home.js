const home = require("../models/Home")
// Placeholder for a home model

async function index (req, res) {
    try {
        const scores = await home.getAllScores();
        res.status(200).json(scores);
    } catch (err) {
        res.status(500).json({"error": err.message})
    }
}

async function create (req, res) {
    try {
        const player = await home.create(req.body);
        res.status(201).json(player);
    } catch (err) {
        res.status(404).json({"error": err.message})
    }
}




module.exports = {
    index,
    create
}