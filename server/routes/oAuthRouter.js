const express = require('express');
const app = express.Router();
const {
    initiateGoogleOAuth,
    handleGoogleCallback,
    initiateMicrosoftOAuth,
    handleMicrosoftCallback,
    initiateYahooOAuth,
    handleYahooCallback,
} = require('../controllers/oAuthController');
const { authenticateUser } = require("../utilities/userUtil");

app.get("/", (req, res) => {
    res.send("Welcome to OAuth Router!");
});

// Google OAuth
app.get('/google/initiate', authenticateUser, initiateGoogleOAuth);
app.get('/google/callback', handleGoogleCallback);

// Microsoft OAuth
app.get('/microsoft/initiate', authenticateUser, initiateMicrosoftOAuth);
app.get('/microsoft/callback', handleMicrosoftCallback);
// Yahoo OAuth
app.get('/yahoo/initiate', authenticateUser, initiateYahooOAuth);
app.get('/yahoo/callback', handleYahooCallback);

module.exports = app;