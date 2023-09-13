const bcrypt = require("bcrypt");
const {PythonShell} = require("python-shell");

const User = require("../models/User")
const Encounter = require("../models/Encounter");
const Code = require("../models/Code");
const Token = require("../models/Token");
const EmailToken = require("../models/EmailToken");
const Scoreboard = require("../models/Scoreboard");

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
            return res.status(401).json({error: "User not found"});
        }

        if (!await user.isActivated()) {
            return res.status(403).json({error: "User not activated"});
        }

        const authenticated = await bcrypt.compare(data.password, user.password);

        if (!authenticated) {
            return res.status(401).json({error: "Invalid credentials"});
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

        // init the user's score to 0
        await Scoreboard.initEmpty(user.username);

        await user.activate();
        await EmailToken.deleteAllByUsername(emailToken.username);

        res.status(302).json({status: "success"});
    } catch (error) {
        res.status(404).json({error: error.message});
    }
}

async function sendResetPasswordEmail(req, res) {
    try {
        const data = req.body;
        const user = await User.getByEmail(data.email);

        // delete any existing reset password links for the user
        await EmailToken.deleteAllByUsername(user.username);

        // create a new reset password link for the user
        const resetUrl = await EmailToken.create(user.username);

        // send the link via email
        await mailer(user.username, resetUrl, user.email, 'reset');

        res.status(200).json({status: "success"});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

async function resetPassword(req, res) {
    try {
        const password = req.body;
        const user = await User.getByUsername(res.locals.user);

        await user.updatePassword(password);

        res.status(200).json({status: "success"});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

async function randomEncounter(req, res) {
    try {
        // get user from session
        const user = res.locals.user;

        // extract the done session encounters from the token
        const doneEncounters = await Token.getSessionEncounters(user);

        // get a random encounter that the user has not done yet
        const encounter = await Encounter.getRandom(doneEncounters);

        // add the encounter to the user's session
        await Token.addSessionEncounter(user, encounter._id);

        // no need to send the _id to the client
        delete encounter._id;

        res.status(200).json({encounter});
    } catch (error) {
        // i am a teapot
        res.status(418).json({error: error.message});
    }
}

async function randomCodeSnippet(req, res) {
    try {
        // get user from session
        const user = res.locals.user;

        // extract the done session code snippets from the token
        const doneCodeSnippets = await Token.getSessionCodeSnippets(user);

        // get a random code snippet that the user has not done yet
        const codeSnippet = await Code.getRandom(doneCodeSnippets);

        // add the encounter to the user's session
        await Token.addSessionCodeSnippet(user, codeSnippet._id);

        // we actually need to send the _id to the client
        // in order to be able to submit the code later
        //delete codeSnippet._id;

        res.status(200).json({codeSnippet});
    } catch (error) {
        res.status(418).json({error: error.message});
    }
}

async function executeCode(req, res) {
    try {
        const snippet = await Code.getById(req.body._id);

        // Set up PythonShell
        const options = {
            mode: 'text',
            pythonPath: 'python', // Path to your Python interpreter
        };

        // append the function name to the code
        const finalCode = `def ${snippet.funcName}:\n${req.body.code}\n\n${snippet.tests}`;

        // append to the final code
        const output = await PythonShell.runString(finalCode, options);

        // if all outputs are true, then the code is correct
        if (output.every(x => x === 'True')) {
            // increment the user's score
            await Scoreboard.incrementScore(res.locals.user);
            return res.status(200).json({result: "correct"});
        }

        // else code is incorrect
        return res.status(200).json({result: "incorrect"});

    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

// scoreboard functions
async function getScoreboard(req, res) {
    try {
        const scoreboard = await Scoreboard.getAll();

        return res.status(200).json({scoreboard});
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

async function incrementUserScore(req, res) {
    try {
        const username = res.locals.user;
        // getting the user from the database to get the current score
        const user = await Scoreboard.getByUsername(username);

        // increment the score by 1
        await Scoreboard.incrementScore(username);

        return res.status(200).json({score: user.score + 1});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

module.exports = {
    register,
    login,
    logout,
    loggedInCheck,

    verify,
    sendResetPasswordEmail,
    resetPassword,

    executeCode,
    randomCodeSnippet,
    randomEncounter,

    getScoreboard,
    incrementUserScore,
}