const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = require('./serverUrl');// TODO: fix base url

passport.serializeUser(function (user, done) {
    done(null, user.sessionID); // Store user's session ID
});

passport.deserializeUser(function (sessionID, done) {
    const userData = retrieveSessionData(sessionID); // Retrieve user data from your session mechanism
    if (userData) {
        done(null, userData); // Pass the retrieved user data to Passport
    } else {
        done(new Error('User not found'));
    }
});


// Set up Google OAuth2 strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    // TODO: change callback to server deployment url
    callbackURL: 'http://localhost:8080/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // Process user profile data here
    getUserProfile(accessToken).then();
}), (error, user, done) => {
    done(error, user);
});

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
const googleAuth = async (req, res) => {
    passport.authenticate('google', {scope: ['profile', 'email']});
}
const googleAuthCallback = async (req, res) => {
    passport.authenticate('google', {failureRedirect: '/'}),
        function (req, res) {
            return res.send({message: "google auth callback"});
        }
}

module.exports = {
    googleAuth,
    googleAuthCallback,
};