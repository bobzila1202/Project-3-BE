const Home = require("../models/Home")
// Placeholder for a home model

async function index (req, res) {
    try {
        //const scores = await Home.getAllScores();
        res.status(200).end()
    } catch (err) {
        res.status(500).json({"error": err.message})
    }
}

async function create (req, res) {
    try {
        //const player = await Home.create(req.body);
        res.status(201).end()
    } catch (err) {
        res.status(404).json({"error": err.message})
    }
}




module.exports = {
    index,
    create
}