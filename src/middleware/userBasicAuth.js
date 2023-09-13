const Token = require("../models/Token");
const User = require("../models/User");

async function authenticator(req, res, next) {
    try {
        const extractedToken = req.headers.cookie.split("=")[1];

        if (extractedToken.length === 0) {
            throw new Error("Empty Token");
        } else {
            const validToken = await Token.getByToken(extractedToken);

            // check user activated
            const user = await User.getByUsername(validToken.account_username);
            if (!await user.isActivated()) {
                throw new Error("User is not activated.");
            }

            // check token expiration
            if(await validToken.isExpired()){
                throw new Error("Token expired");
            }

            // save token and username to res.locals for the next endpoint
            res.locals.token = extractedToken;
            res.locals.user = validToken.account_username;
            next();
        }
    } catch (err) {
        res.status(403).json({error: "Unauthorized"});
    }
}

module.exports = authenticator;