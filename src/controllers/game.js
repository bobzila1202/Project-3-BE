const Game = require("../models/Game")
// Placeholder for a Game model

async function show (req, res) {
    try {
        const id = parseInt(req.params.id);
        const player = await Game.getPlayerById(id);
        res.status(200).json(player);
    } catch (err) {
        res.status(404).json({"error": err.message})
    }
}



module.exports = {
    show
}