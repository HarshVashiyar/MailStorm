const express = require('express');
const app = express.Router();
const { handleUnsubscribe } = require('../controllers/unsubscribeController');

// Public route — no auth required (accessed from email links)
app.get('/:token', handleUnsubscribe);

module.exports = app;
