const express = require("express");
const router = express.Router();


const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

let userData = null;

// Set up Google OAuth2 strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:8080/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // no need for session support here
    userData = profile;
    return done(null);
}));

// Serialize and deserialize user data
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Get user profile data from Google API
async function getUserProfile(accessToken) {
    const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
    const headers = {
        'Authorization': `Bearer ${accessToken}`
    };

    try {
        const response = await fetch(url, {headers});
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(`Error fetching user profile: ${response.status}`);
        }
    } catch (error) {
        throw error;
    }
}

// google oauth2
const googleAuth = passport.authenticate('google', {scope: ['profile', 'email']});

const googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', {failureRedirect: '/'}, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            // TODO: redirect since failed login attempt
            return res.redirect('/login');
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            // TODO: Redirect to the user profile page
            return res.redirect('/');
        });
    })(req, res, next);
};

router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuthCallback);

module.exports = router;