const express = require("express");
const router = express.Router();

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
// const User = require('../models/User');
// const Token = require('../models/Token');

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        // TODO: change callback to server deployment url
        callbackURL: 'http://localhost:8080/auth/facebook/callback'
    },
    function (accessToken, refreshToken, profile, done) {
        // Process user profile data here
        // try {
        //     // TODO: check if user exists
        //     const foundUser = User.getByUsername(profile.id.split("_")[0]);
        //     if (foundUser) {
        //         // user exists, log them in
        //         const token = Token.create(foundUser.username);
        //
        //         res
        //             .cookie("authorization", token.token, {
        //                 httpOnly: true,
        //                 secure: true,
        //                 sameSite: "strict",
        //                 domain: "localhost",
        //                 path: "/",
        //                 priority: "high",
        //                 maxAge: 30 * 60 * 1000, // 30 minutes maxAge as defined in database table
        //             }).redirect(BASE_URL + "/");
        //     }
        // } catch (error) {
        //     if (error === "Unable to locate user.") {
        //         //check if email is visible
        //         const email = profile.emails[0].value || "private_facebook_managed";
        //         // set the unique id as the username
        //         const username = profile.id + "_facebook";
        //         const password = accessToken;
        //
        //         // create the user
        //         const newUser = User.create({username, password, email});
        //
        //         // no need for activation link, so just log them in
        //         const token = Token.create(newUser.username);
        //
        //         res
        //             .cookie("authorization", token.token, {
        //                 httpOnly: true,
        //                 secure: true,
        //                 sameSite: "strict",
        //                 domain: "localhost",
        //                 path: "/",
        //                 priority: "high",
        //                 maxAge: 30 * 60 * 1000, // 30 minutes maxAge as defined in database table
        //             }).redirect(BASE_URL + "/");
        //     }
        //     // otherwise there was another error, redirect to login again
        //     done(error);
        // }
    }));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


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

// facebook oauth2
router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['profile', 'email']}));
router.get('/auth/facebook/callback', (req, res) => {
    passport.authenticate('facebook', {failureRedirect: '/login'}),
        function (req, res) {
            console.log(req.user);
        }
});



module.exports = router;