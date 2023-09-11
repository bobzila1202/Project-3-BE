const express = require("express");

const router = express.Router();

// TODO: placeholder for mapping html to routes
const home = require("../controllers/home");


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