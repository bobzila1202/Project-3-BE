const { Router } = require('express');

// Placeholder for a Game route, TODO: refactor

const user = require('../controllers/user');

const router = Router();

router.get("/", user.getAll);

module.exports = router;