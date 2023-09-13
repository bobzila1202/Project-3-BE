const {Router} = require('express');

const authenticator = require("../middleware/userBasicAuth");
const validateParameters = require("../middleware/validateParams");
const recaptchaValidation = require("../middleware/recaptchaValidation");
const user = require('../controllers/user');

const router = Router();

// public routes
// login
router.post("/login", validateParameters({
    username: {type: 'stringWithMaxLength', maxLength: 32}, password: {type: 'stringWithMaxLength', maxLength: 64},
}), user.login);

// register
router.post("/register", validateParameters({
    username: {type: 'stringWithMaxLength', maxLength: 32},
    password: {type: 'stringWithMaxLength', maxLength: 64},
    email: {type: 'stringWithMaxLength', maxLength: 64}
}), user.register);

// verify email for account activation
router.get("/verify/:emailToken", user.verify);

// send reset password email
router.post("/reset", recaptchaValidation, validateParameters({
    email: {type: 'stringWithMaxLength', maxLength: 64},
}), user.sendResetPasswordEmail);

// reset password page
router.get("/reset/:emailToken", validateParameters({
    password: {type: 'stringWithMaxLength', maxLength: 64},
}), user.resetPassword);


// authenticated routes
// logout
router.post("/logout", authenticator, user.logout);

// ping
router.post("/ping", authenticator, user.loggedInCheck);

// submit code snippet
router.post("/code", authenticator, validateParameters({
    code: {type: 'stringWithMaxLength', maxLength: 10000}
}), user.executeCode);

// random encounter by using the user's current session
router.post("/encounter", authenticator, user.randomEncounter);

// scoreboard mappings
router.get("/leaderboard", authenticator, user.getScoreboard);
router.post("/leaderboard", authenticator, user.incrementUserScore);

// code snippet mappings
router.post("/code", authenticator, validateParameters({
    code: {type: 'stringWithMaxLength', maxLength: 10000}
}), user.executeCode);
router.get("/code", authenticator, user.randomCodeSnippet);

module.exports = router;