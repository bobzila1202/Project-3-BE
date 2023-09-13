const User = require("../models/User")

const bcrypt = require("bcrypt");
const Token = require("../models/Token");
const EmailToken = require("../models/EmailToken");
const mailer = require("../middleware/mailer");

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS);
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?!.*\s).{8,}$/;

async function register(req, res) {
    const data = req.body;

    try {
        if (!PASSWORD_REGEX.test(data.password)) {
            throw new Error("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character");
        }

        const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
        data["password"] = await bcrypt.hash(data.password, salt);

        const newUser = await User.create(data);

        const activationUrl = await EmailToken.create(newUser.username);
        console.log(activationUrl);

        await mailer(newUser.username, activationUrl, newUser.email, 'register');
        return res.status(201).json({status: "success"});
    } catch (error) {
        if (error.detail) {
            return res.status(400).json({error: error.detail});
        }

        return res.status(400).json({error: error.message});
    }
}

async function login(req, res) {
    try {
        const data = req.body;

        const user = await User.getByUsername(data.username);

        if (!user) {
            return res.status(400).json({error: "User not found"});
        }

        if (!await user.isActivated()) {
            return res.status(400).json({error: "User not activated"});
        }

        const authenticated = await bcrypt.compare(data.password, user.password);

        if (!authenticated) {
            return res.status(400).json({error: "Invalid credentials"});
        } else {
            const token = await Token.create(user.username);

            res
                .cookie("authorization", token.token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "lax",
                    path: "/",
                    priority: "high",
                    maxAge: 30 * 60 * 1000, // 30 minutes maxAge as defined in database table
                })
                .status(200)
                .json({authorized: true});
        }
    } catch (error) {
        res.status(403).json({error: "Unauthorized"});
    }
}

async function logout(req, res) {
    try {
        await Token.delete(res.locals.token);
        res.clearCookie("authorization");
        res.status(302).redirect("/");
    } catch (error) {
    }
}

async function loggedInCheck(req, res, next) {
    res.redirect("/home");
}

async function verify(req, res) {
    try {
        const emailToken = await EmailToken.getOneByToken(req.params.emailToken);
        const user = await User.getByUsername(emailToken.username);

        await user.activate();
        await EmailToken.deleteAllByUsername(emailToken.username);

        res.status(302).json({status: "success"});
    } catch (error) {
        res.status(404).json({error: error.message});
    }
}

// const verify = async (req, res) => {
//     try {
//
//         const emailToken = await EmailToken.getOneByToken(req.params.emailToken);
//         const user = await User.getByUsername(emailToken.username);
//
//         await user.activate();
//         await EmailToken.deleteByUsername(emailToken.username);
//
//         res.status(302).redirect("/login");
//     } catch (error) {
//         res.status(404).json({error: error.message});
//     }
// };

module.exports = {
    register,
    login,
    logout,
    loggedInCheck,
    verify,
}