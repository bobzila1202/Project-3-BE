const express = require("express");
const router = express.Router();

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const Token = require('../models/Token');

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:8080/auth/facebook/callback'
}, function (accessToken, refreshToken, profile, done) {
    // no need for session support here
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));


// Get user profile data from Google API
async function getUserProfile(accessToken) {
    const url = 'https://graph.facebook.com/me?fields=id,name,email';
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

// Define the route handler for initiating Facebook OAuth
router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['profile', 'email']}));

// Define the route handler for handling the callback from Facebook
router.get('/auth/facebook/callback', (req, res) => {
    passport.authenticate('facebook', {failureRedirect: '/login'}, (err, user) => {
        if (err) {
            // Handle error
            return res.status(500).json({error: err.message});
        }
        if (!user) {
            // Handle failed authentication
            return res.redirect('/login'); // Redirect to the login page or another appropriate route
        }

        // Successful authentication; you can access the user profile here
        console.log(user);

        // Redirect to the desired page after successful authentication
        return res.redirect('/');
    })(req, res);
});


module.exports = router;