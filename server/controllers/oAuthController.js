const { google } = require('googleapis');
const axios = require('axios');
const SmtpAccount = require('../models/SmtpAccount');
const smtpUtil = require('../utilities/smtpUtil');
const crypto = require('crypto');

// Helper function to generate and verify state
const generateState = (userId, slotNumber, provider) => {
  const data = `${userId}:${slotNumber}:${provider}:${Date.now()}`;
  return Buffer.from(data).toString('base64');
};

const parseState = (state) => {
  try {
    const data = Buffer.from(state, 'base64').toString('utf-8');
    const [userId, slotNumber, provider, timestamp] = data.split(':');
    // Check if state is not older than 10 minutes
    if (Date.now() - parseInt(timestamp) > 10 * 60 * 1000) {
      return null;
    }
    return { userId, slotNumber: parseInt(slotNumber), provider };
  } catch (err) {
    return null;
  }
};

/**
 * Initiate Google OAuth flow
 * GET /api/oauth/google/initiate?slotNumber=1
 */
const initiateGoogleOAuth = async (req, res) => {
  const { slotNumber } = req.query;
  const user = req.user;
  try {
    const userId = user.id;
    if (!slotNumber || slotNumber < 1 || slotNumber > 5) {
      return res.status(400).json({
        success: false,
        message: "Valid slot number (1-5) is required"
      });
    }

    // Check if slot is available
    const availableSlots = await smtpUtil.getAvailableSlotNumbers(userId);
    if (!availableSlots.includes(parseInt(slotNumber))) {
      return res.status(400).json({
        success: false,
        message: `Slot ${slotNumber} is already occupied`
      });
    }

    // Generate state parameter instead of storing in session
    const state = generateState(userId, slotNumber, 'gmail');

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    let authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force to get refresh token
    });
    
    // Manually append state parameter to ensure it's included
    authUrl += `&state=${encodeURIComponent(state)}`;

    return res.status(200).json({
      success: true,
      message: "Google OAuth URL generated",
      data: { authUrl }
    });
  } catch (error) {
    console.error("Error initiating Google OAuth:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate Google OAuth",
      error: error.message
    });
  }
};

/**
 * Google OAuth callback
 * GET /api/oauth/google/callback?code=xxx&state=xxx
 */
const handleGoogleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      console.error('No authorization code received');
      return res.redirect(`${process.env.FRONTEND_URL}/profile?error=no_code`);
    }

    // Parse and verify state
    const oauthData = parseState(state);
    if (!oauthData || oauthData.provider !== 'gmail') {
      console.error('Invalid state or provider mismatch. Parsed state:', oauthData);
      return res.redirect(`${process.env.FRONTEND_URL}/profile?error=invalid_session`);
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Get user email
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Create SMTP account - only include refreshToken if it exists
    const oauthTokens = {
      accessToken: tokens.access_token,
      tokenExpiry: new Date(tokens.expiry_date),
    };
    
    // Only add refreshToken if it's actually returned
    if (tokens.refresh_token) {
      oauthTokens.refreshToken = tokens.refresh_token;
    }

    const smtpAccount = new SmtpAccount({
      userId: oauthData.userId,
      slotNumber: oauthData.slotNumber,
      provider: 'gmail',
      email: userInfo.data.email,
      authType: 'oauth',
      oauthTokens: oauthTokens,
      status: 'active',
      isVerified: true,
    });
    await smtpAccount.save();
    return res.redirect(`${process.env.FRONTEND_URL}/profile?success=gmail_added&slot=${oauthData.slotNumber}`);
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/profile?error=auth_failed`);
  }
};

/**
 * Initiate Microsoft OAuth flow
 * GET /api/oauth/microsoft/initiate?slotNumber=1
 */
const initiateMicrosoftOAuth = async (req, res) => {
  try {
    const { slotNumber } = req.query;
    const userId = req.user.id;

    if (!slotNumber || slotNumber < 1 || slotNumber > 5) {
      return res.status(400).json({
        success: false,
        message: "Valid slot number (1-5) is required"
      });
    }

    const availableSlots = await smtpUtil.getAvailableSlotNumbers(userId);
    if (!availableSlots.includes(parseInt(slotNumber))) {
      return res.status(400).json({
        success: false,
        message: `Slot ${slotNumber} is already occupied`
      });
    }

    // Generate state parameter instead of storing in session
    const state = generateState(userId, slotNumber, 'outlook');

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${process.env.MICROSOFT_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(process.env.MICROSOFT_REDIRECT_URI)}` +
      `&scope=${encodeURIComponent('https://outlook.office.com/SMTP.Send offline_access openid email')}` +
      `&response_mode=query` +
      `&prompt=consent` +
      `&state=${encodeURIComponent(state)}`;

    return res.status(200).json({
      success: true,
      message: "Microsoft OAuth URL generated",
      data: { authUrl }
    });
  } catch (error) {
    console.error("Error initiating Microsoft OAuth:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate Microsoft OAuth",
      error: error.message
    });
  }
};

/**
 * Microsoft OAuth callback
 * GET /api/oauth/microsoft/callback?code=xxx&state=xxx
 */
const handleMicrosoftCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    // Parse and verify state
    const oauthData = parseState(state);
    if (!oauthData || oauthData.provider !== 'outlook') {
      console.error('Invalid state or provider mismatch. Parsed state:', oauthData);
      return res.redirect(`${process.env.FRONTEND_URL}/profile?error=invalid_session`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/profile?error=no_code`);
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const tokens = tokenResponse.data;

    // Get user email from ID token
    const idTokenPayload = JSON.parse(
      Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
    );

    const smtpAccount = new SmtpAccount({
      userId: oauthData.userId,
      slotNumber: oauthData.slotNumber,
      provider: 'outlook',
      email: idTokenPayload.email || idTokenPayload.preferred_username,
      authType: 'oauth',
      oauthTokens: {
        accessToken: tokens.access_token,
        ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
        tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
      status: 'active',
      isVerified: true,
    });

    await smtpAccount.save();

    return res.redirect(`${process.env.FRONTEND_URL}/profile?success=outlook_added&slot=${oauthData.slotNumber}`);
  } catch (error) {
    console.error("Error in Microsoft OAuth callback:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/profile?error=auth_failed`);
  }
};

/**
 * Initiate Yahoo OAuth flow
 * GET /api/oauth/yahoo/initiate?slotNumber=1
 */
const initiateYahooOAuth = async (req, res) => {
  try {
    const { slotNumber } = req.query;
    const userId = req.user.id;

    if (!slotNumber || slotNumber < 1 || slotNumber > 5) {
      return res.status(400).json({
        success: false,
        message: "Valid slot number (1-5) is required"
      });
    }

    const availableSlots = await smtpUtil.getAvailableSlotNumbers(userId);
    if (!availableSlots.includes(parseInt(slotNumber))) {
      return res.status(400).json({
        success: false,
        message: `Slot ${slotNumber} is already occupied`
      });
    }

    // Generate state parameter instead of storing in session
    const state = generateState(userId, slotNumber, 'yahoo');

    const authUrl = `https://api.login.yahoo.com/oauth2/request_auth?` +
      `client_id=${process.env.YAHOO_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.YAHOO_REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=mail-w` +
      `&state=${encodeURIComponent(state)}`;

    return res.status(200).json({
      success: true,
      message: "Yahoo OAuth URL generated",
      data: { authUrl }
    });
  } catch (error) {
    console.error("Error initiating Yahoo OAuth:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate Yahoo OAuth",
      error: error.message
    });
  }
};

/**
 * Yahoo OAuth callback
 * GET /api/oauth/yahoo/callback?code=xxx&state=xxx
 */
const handleYahooCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    // Parse and verify state
    const oauthData = parseState(state);
    if (!oauthData || oauthData.provider !== 'yahoo') {
      console.error('Invalid state or provider mismatch. Parsed state:', oauthData);
      return res.redirect(`${process.env.FRONTEND_URL}/profile?error=invalid_session`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/profile?error=no_code`);
    }

    // Exchange code for tokens
    const credentials = Buffer.from(
      `${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`
    ).toString('base64');

    const tokenResponse = await axios.post(
      'https://api.login.yahoo.com/oauth2/get_token',
      new URLSearchParams({
        code: code,
        redirect_uri: process.env.YAHOO_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        }
      }
    );

    const tokens = tokenResponse.data;

    // Get user info
    const userInfoResponse = await axios.get(
      'https://api.login.yahoo.com/openid/v1/userinfo',
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      }
    );

    const smtpAccount = new SmtpAccount({
      userId: oauthData.userId,
      slotNumber: oauthData.slotNumber,
      provider: 'yahoo',
      email: userInfoResponse.data.email,
      authType: 'oauth',
      oauthTokens: {
        accessToken: tokens.access_token,
        ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
        tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
      status: 'active',
      isVerified: true,
    });

    await smtpAccount.save();

    return res.redirect(`${process.env.FRONTEND_URL}/profile?success=yahoo_added&slot=${oauthData.slotNumber}`);
  } catch (error) {
    console.error("Error in Yahoo OAuth callback:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/profile?error=auth_failed`);
  }
};

module.exports = {
  initiateGoogleOAuth,
  handleGoogleCallback,
  initiateMicrosoftOAuth,
  handleMicrosoftCallback,
  initiateYahooOAuth,
  handleYahooCallback,
};