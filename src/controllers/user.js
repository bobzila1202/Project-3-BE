const { json } = require("stream/consumers");
const User = require("../models/User")

// Placeholder for a Game model

async function getAll(req, res) {
    try {
        //const id = parseInt(req.params.id);
        const player = await User.getAll();
        res.status(200).json(player)
    } catch (err) {
        res.status(404).json({"error": err.message})
    }
}


module.exports = {
    getAll
}