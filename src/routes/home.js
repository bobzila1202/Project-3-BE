const express = require("express");

const router = express.Router();

router.get("/health", async (req, res) => {res.status(200).json({status: "ok"}).end()});

// keep always last, handles all other unimplemented routes
router.get("*", (req, res) => {
    // TODO: possibly custom 404 page
    return res.status(404).json({error: "not found"}).end();
});

router.all("*", (req, res) => {
    // TODO: possibly custom json response
    res.status(404).json({error: "Not implemented yet."});
});

module.exports = router;