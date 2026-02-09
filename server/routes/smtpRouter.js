const express = require('express');
const app = express.Router();
const {
    getUserSmtpSlots,
    getAvailableSlots,
    addCustomSmtp,
    addOAuthSmtp,
    verifyCustomSmtp,
    deleteSmtpSlot,
    updateSmtpStatus,
    getSmtpStats,
    getSignature,
    updateSignature,
    deleteSignature,
} = require('../controllers/smtpController');
const { authenticateUser } = require("../utilities/userUtil");

app.get("/", (req, res) => {
    res.send("Welcome to SMTP Router!");
});

// Get all SMTP slots for user
app.get('/slots', authenticateUser, getUserSmtpSlots);

// Get available slot numbers
app.get('/available-slots', authenticateUser, getAvailableSlots);

// Get statistics
app.get('/stats', authenticateUser, getSmtpStats);

// Add custom SMTP account
app.post('/add-custom', authenticateUser, addCustomSmtp);

// Add OAuth SMTP account
app.post('/add-oauth', authenticateUser, addOAuthSmtp);

// Verify custom SMTP
app.post('/verify/:slotNumber', authenticateUser, verifyCustomSmtp);

// Delete SMTP slot
app.delete('/slot/:slotNumber', authenticateUser, deleteSmtpSlot);

// Update SMTP status
app.patch('/slot/:slotNumber/status', authenticateUser, updateSmtpStatus);

// Signature CRUD routes
app.get('/slot/:slotNumber/signature', authenticateUser, getSignature);
app.put('/slot/:slotNumber/signature', authenticateUser, updateSignature);
app.delete('/slot/:slotNumber/signature', authenticateUser, deleteSignature);

module.exports = app;