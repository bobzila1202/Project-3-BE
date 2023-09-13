const { Router } = require('express');

const authenticator = require("../middleware/userBasicAuth");
const validateParameters = require("../middleware/validateParams");
const recaptchaValidation = require("../middleware/recaptchaValidation");
const user = require('../controllers/user');

const router = Router();

// login
router.post("/login", recaptchaValidation, validateParameters({
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

// logout
router.post("/logout", authenticator, user.logout);

// ping
router.post("/ping", authenticator, user.loggedInCheck);



module.exports = router;