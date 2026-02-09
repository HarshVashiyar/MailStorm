const SmtpAccount = require('../models/SmtpAccount');
const smtpUtil = require('../utilities/smtpUtil');

/**
 * Get decrypted credentials for sending emails
 * @param {Object} smtpAccount - The SMTP account document
 * @returns {Object} Decrypted credentials object
 */
const getDecryptedCredentials = (smtpAccount) => {
  if (smtpAccount.authType === 'oauth') {
    return {
      type: 'oauth',
      provider: smtpAccount.provider,
      email: smtpAccount.email,
      accessToken: smtpAccount.decryptData(smtpAccount.oauthTokens.accessToken),
      refreshToken: smtpAccount.decryptData(smtpAccount.oauthTokens.refreshToken),
      tokenExpiry: smtpAccount.oauthTokens.tokenExpiry,
    };
  } else {
    return {
      type: 'password',
      provider: smtpAccount.provider,
      email: smtpAccount.email,
      host: smtpAccount.smtpConfig.host,
      port: smtpAccount.smtpConfig.port,
      secure: smtpAccount.smtpConfig.secure,
      password: smtpAccount.decryptData(smtpAccount.smtpConfig.encryptedPassword),
    };
  }
};

/**
 * Update OAuth tokens (when refreshed)
 * @param {Object} smtpAccount - The SMTP account document
 * @param {String} accessToken - New access token
 * @param {String} refreshToken - New refresh token (optional)
 * @param {Number} expiresIn - Token expiry time in seconds (default 3600)
 * @returns {Promise<Object>} Updated account
 */
const updateOAuthTokens = async (smtpAccount, accessToken, refreshToken = null, expiresIn = 3600) => {
  smtpAccount.oauthTokens.accessToken = accessToken;
  if (refreshToken) {
    smtpAccount.oauthTokens.refreshToken = refreshToken;
  }
  smtpAccount.oauthTokens.tokenExpiry = new Date(Date.now() + expiresIn * 1000);

  return await smtpAccount.save();
};

/**
 * Check if OAuth token is expired
 * @param {Object} smtpAccount - The SMTP account document
 * @returns {Boolean} True if expired, false otherwise
 */
const isTokenExpired = (smtpAccount) => {
  if (!smtpAccount.oauthTokens.tokenExpiry) return true;
  return new Date() >= smtpAccount.oauthTokens.tokenExpiry;
};

/**
 * Increment email count and update usage stats
 * @param {Object} smtpAccount - The SMTP account document
 * @returns {Promise<Object>} Updated account
 */
const incrementEmailCount = async (smtpAccount) => {
  // Check if we need to reset daily counter
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastReset = new Date(smtpAccount.lastResetDate);
  lastReset.setHours(0, 0, 0, 0);

  if (today > lastReset) {
    smtpAccount.emailsSentToday = 0;
    smtpAccount.lastResetDate = new Date();
  }

  smtpAccount.emailsSentToday += 1;
  smtpAccount.totalEmailsSent += 1;
  smtpAccount.lastUsedAt = new Date();

  return await smtpAccount.save();
};

/**
 * Check if account can send email (within daily limit and active)
 * @param {Object} smtpAccount - The SMTP account document
 * @returns {Boolean} True if can send, false otherwise
 */
const canSendEmail = (smtpAccount) => {
  return smtpAccount.status === 'active' &&
    smtpAccount.isVerified &&
    smtpAccount.emailsSentToday < smtpAccount.dailyLimit;
};

/**
 * Get next available SMTP slot for a user (least recently used)
 * @param {String} userId - User's ObjectId
 * @returns {Promise<Object|null>} Available SMTP account or null
 */
const getNextAvailableSlot = async (userId) => {
  const accounts = await SmtpAccount.find({
    userId,
    status: 'active',
    isVerified: true
  }).sort({ lastUsedAt: 1 }); // Least recently used first

  for (let account of accounts) {
    if (canSendEmail(account)) {
      return account;
    }
  }

  return null; // No available slots
};

/**
 * Get all SMTP slots for a user
 * @param {String} userId - User's ObjectId
 * @returns {Promise<Array>} Array of SMTP accounts
 */
const getUserSlots = async (userId) => {
  return await SmtpAccount.find({ userId }).sort({ slotNumber: 1 });
};

/**
 * Log error for an SMTP account
 * @param {Object} smtpAccount - The SMTP account document
 * @param {String} errorMessage - Error message to log
 * @returns {Promise<Object>} Updated account
 */
const logSmtpError = async (smtpAccount, errorMessage) => {
  smtpAccount.errorLog.lastError = errorMessage;
  smtpAccount.errorLog.lastErrorAt = new Date();
  smtpAccount.status = 'error';

  return await smtpAccount.save();
};

/**
 * Mark account as needing re-authentication
 * @param {Object} smtpAccount - The SMTP account document
 * @returns {Promise<Object>} Updated account
 */
const markNeedsReauth = async (smtpAccount) => {
  smtpAccount.status = 'needs_reauth';
  smtpAccount.errorLog.lastError = 'Authentication required';
  smtpAccount.errorLog.lastErrorAt = new Date();

  return await smtpAccount.save();
};

/**
 * Reset daily email counter for all accounts (run at midnight)
 * @returns {Promise<Object>} Update result
 */
const resetDailyCounters = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await SmtpAccount.updateMany(
    { lastResetDate: { $lt: today } },
    {
      $set: {
        emailsSentToday: 0,
        lastResetDate: new Date()
      }
    }
  );
};

/**
 * Get SMTP account by slot number for a user
 * @param {String} userId - User's ObjectId
 * @param {Number} slotNumber - Slot number (1-5)
 * @returns {Promise<Object|null>} SMTP account or null
 */
const getSlotByNumber = async (userId, slotNumber) => {
  return await SmtpAccount.findOne({ userId, slotNumber });
};

/**
 * Delete SMTP account by slot number
 * @param {String} userId - User's ObjectId
 * @param {Number} slotNumber - Slot number (1-5)
 * @returns {Promise<Object|null>} Deleted account or null
 */
const deleteSlot = async (userId, slotNumber) => {
  return await SmtpAccount.findOneAndDelete({ userId, slotNumber });
};

/**
 * Get total emails sent today across all user's accounts
 * @param {String} userId - User's ObjectId
 * @returns {Promise<Number>} Total emails sent today
 */
const getTotalEmailsSentToday = async (userId) => {
  const accounts = await SmtpAccount.find({ userId });
  return accounts.reduce((total, account) => total + account.emailsSentToday, 0);
};

/**
 * Get account usage statistics for a user
 * @param {String} userId - User's ObjectId
 * @returns {Promise<Object>} Usage statistics
 */
const getUserStats = async (userId) => {
  const accounts = await SmtpAccount.find({ userId });

  return {
    totalSlots: accounts.length,
    activeSlots: accounts.filter(acc => acc.status === 'active' && acc.isVerified).length,
    emailsSentToday: accounts.reduce((total, acc) => total + acc.emailsSentToday, 0),
    totalEmailsSent: accounts.reduce((total, acc) => total + acc.totalEmailsSent, 0),
    availableCapacity: accounts.reduce((total, acc) => {
      if (acc.status === 'active' && acc.isVerified) {
        return total + (acc.dailyLimit - acc.emailsSentToday);
      }
      return total;
    }, 0),
  };
};

/**
 * Get all SMTP slots for logged-in user
 * GET /api/smtp/slots
 */
const getUserSmtpSlots = async (req, res) => {
  const user = req.user;
  try {
    const userId = user.id;
    const slots = await getUserSlots(userId);
    const stats = await getUserStats(userId);

    // Don't send encrypted data to frontend
    const sanitizedSlots = slots.map(slot => ({
      _id: slot._id,
      slotNumber: slot.slotNumber,
      provider: slot.provider,
      email: slot.email,
      authType: slot.authType,
      status: slot.status,
      isVerified: slot.isVerified,
      emailsSentToday: slot.emailsSentToday,
      dailyLimit: slot.dailyLimit,
      totalEmailsSent: slot.totalEmailsSent,
      lastUsedAt: slot.lastUsedAt,
      createdAt: slot.createdAt,
      errorLog: slot.errorLog,
      signature: slot.signature, // Include signature in response
    }));

    return res.status(200).json({
      success: true,
      message: "SMTP slots fetched successfully",
      data: {
        slots: sanitizedSlots,
        stats: stats,
      }
    });
  } catch (error) {
    console.error("Error fetching SMTP slots:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch SMTP slots",
      error: error.message
    });
  }
};

/**
 * Get available slot numbers for user
 * GET /api/smtp/available-slots
 */
const getAvailableSlots = async (req, res) => {
  try {
    const userId = req.user.id;

    const availableSlots = await smtpUtil.getAvailableSlotNumbers(userId);

    return res.status(200).json({
      success: true,
      message: "Available slots fetched successfully",
      data: availableSlots
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available slots",
      error: error.message
    });
  }
};

/**
 * Add custom SMTP account (password-based)
 * POST /api/smtp/add-custom
 * Body: { slotNumber, email, host, port, secure, password }
 */
const addCustomSmtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slotNumber, email, host, port, secure, password } = req.body;

    // Validation
    if (!slotNumber || !email || !host || !port || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: slotNumber, email, host, port, password"
      });
    }

    // Check if slot is available
    const availableSlots = await smtpUtil.getAvailableSlotNumbers(userId);
    if (!availableSlots.includes(slotNumber)) {
      return res.status(400).json({
        success: false,
        message: `Slot ${slotNumber} is already occupied or invalid`
      });
    }

    // Create new SMTP account
    const smtpAccount = new SmtpAccount({
      userId,
      slotNumber,
      provider: 'custom',
      email,
      authType: 'password',
      smtpConfig: {
        host,
        port,
        secure: secure !== undefined ? secure : true,
        encryptedPassword: password, // Will be encrypted by pre-save hook
      },
      status: 'inactive', // Set to inactive until verified
      isVerified: false,
    });

    await smtpAccount.save();

    // TODO: Send test email to verify SMTP credentials
    // If test succeeds, set isVerified: true and status: 'active'

    return res.status(201).json({
      success: true,
      message: "Custom SMTP account added successfully. Please verify it.",
      data: {
        slotNumber: smtpAccount.slotNumber,
        email: smtpAccount.email,
        provider: smtpAccount.provider,
      }
    });
  } catch (error) {
    console.error("Error adding custom SMTP:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This slot is already occupied"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add custom SMTP account",
      error: error.message
    });
  }
};

/**
 * Add OAuth SMTP account (Gmail, Outlook, Yahoo)
 * POST /api/smtp/add-oauth
 * Body: { slotNumber, provider, email, accessToken, refreshToken, expiresIn }
 */
const addOAuthSmtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slotNumber, provider, email, accessToken, refreshToken, expiresIn } = req.body;

    // Validation
    if (!slotNumber || !provider || !email || !accessToken || !refreshToken) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: slotNumber, provider, email, accessToken, refreshToken"
      });
    }

    // Check if provider is valid OAuth provider
    if (!['gmail', 'outlook', 'yahoo'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OAuth provider. Must be gmail, outlook, or yahoo"
      });
    }

    // Check if slot is available
    const availableSlots = await smtpUtil.getAvailableSlotNumbers(userId);
    if (!availableSlots.includes(slotNumber)) {
      return res.status(400).json({
        success: false,
        message: `Slot ${slotNumber} is already occupied or invalid`
      });
    }

    // Create new SMTP account
    const smtpAccount = new SmtpAccount({
      userId,
      slotNumber,
      provider,
      email,
      authType: 'oauth',
      oauthTokens: {
        accessToken, // Will be encrypted by pre-save hook
        refreshToken, // Will be encrypted by pre-save hook
        tokenExpiry: new Date(Date.now() + (expiresIn || 3600) * 1000),
      },
      status: 'active',
      isVerified: true, // OAuth accounts are pre-verified by provider
    });

    await smtpAccount.save();

    return res.status(201).json({
      success: true,
      message: "OAuth SMTP account added successfully",
      data: {
        slotNumber: smtpAccount.slotNumber,
        email: smtpAccount.email,
        provider: smtpAccount.provider,
      }
    });
  } catch (error) {
    console.error("Error adding OAuth SMTP:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This slot is already occupied"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add OAuth SMTP account",
      error: error.message
    });
  }
};

/**
 * Verify custom SMTP by sending test email
 * POST /api/smtp/verify/:slotNumber
 */
const verifyCustomSmtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slotNumber } = req.params;

    const smtpAccount = await getSlotByNumber(userId, parseInt(slotNumber));

    if (!smtpAccount) {
      return res.status(404).json({
        success: false,
        message: "SMTP account not found"
      });
    }

    if (smtpAccount.authType !== 'password') {
      return res.status(400).json({
        success: false,
        message: "Only custom SMTP accounts need verification"
      });
    }

    // Get decrypted credentials
    const credentials = getDecryptedCredentials(smtpAccount);

    // Create nodemailer transporter with user's SMTP settings
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: credentials.host,
      port: credentials.port,
      secure: credentials.secure,
      auth: {
        user: credentials.email,
        pass: credentials.password,
      },
      connectionTimeout: 10000, // 10 seconds to establish connection
      socketTimeout: 10000, // 10 seconds of inactivity to timeout
      greetingTimeout: 5000, // 5 seconds to wait for greeting
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log(`✅ SMTP verification successful for ${credentials.email}`);
    } catch (verifyError) {
      // Verification failed - log error and keep account inactive
      smtpAccount.errorLog.lastError = `SMTP verification failed: ${verifyError.message}`;
      smtpAccount.errorLog.lastErrorAt = new Date();
      await smtpAccount.save();

      return res.status(400).json({
        success: false,
        message: `SMTP verification failed. Please check your credentials and settings.`,
        error: verifyError.message
      });
    }

    // If successful: activate the account
    smtpAccount.isVerified = true;
    smtpAccount.status = 'active';
    smtpAccount.errorLog.lastError = null; // Clear any previous errors
    await smtpAccount.save();

    return res.status(200).json({
      success: true,
      message: "SMTP account verified successfully"
    });
  } catch (error) {
    console.error("Error verifying SMTP:", error);

    // Log error to account
    const smtpAccount = await getSlotByNumber(req.user.id, parseInt(req.params.slotNumber));
    if (smtpAccount) {
      await logSmtpError(smtpAccount, error.message);
    }

    return res.status(500).json({
      success: false,
      message: "SMTP verification failed",
      error: error.message
    });
  }
};

/**
 * Delete SMTP slot
 * DELETE /api/smtp/slot/:slotNumber
 */
const deleteSmtpSlot = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slotNumber } = req.params;

    const deletedSlot = await deleteSlot(userId, parseInt(slotNumber));

    if (!deletedSlot) {
      return res.status(404).json({
        success: false,
        message: "SMTP slot not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "SMTP slot deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting SMTP slot:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete SMTP slot",
      error: error.message
    });
  }
};

/**
 * Update SMTP slot status (activate/deactivate)
 * PATCH /api/smtp/slot/:slotNumber/status
 * Body: { status: 'active' | 'inactive' }
 */
const updateSmtpStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slotNumber } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'active' or 'inactive'"
      });
    }

    const smtpAccount = await getSlotByNumber(userId, parseInt(slotNumber));

    if (!smtpAccount) {
      return res.status(404).json({
        success: false,
        message: "SMTP account not found"
      });
    }

    smtpAccount.status = status;
    await smtpAccount.save();

    return res.status(200).json({
      success: true,
      message: `SMTP account ${status === 'active' ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error("Error updating SMTP status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update SMTP status",
      error: error.message
    });
  }
};

/**
 * Get user's email sending statistics
 * GET /api/smtp/stats
 */
const getSmtpStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await getUserStats(userId);

    return res.status(200).json({
      success: true,
      message: "Statistics fetched successfully",
      data: stats
    });
  } catch (error) {
    console.error("Error fetching SMTP stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message
    });
  }
};

/**
 * Get signature for an SMTP account
 * GET /api/smtp/slot/:slotNumber/signature
 */
const getSignature = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slotNumber } = req.params;

    const smtpAccount = await getSlotByNumber(userId, parseInt(slotNumber));

    if (!smtpAccount) {
      return res.status(404).json({
        success: false,
        message: "SMTP account not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Signature fetched successfully",
      data: {
        signature: smtpAccount.signature || '',
        slotNumber: smtpAccount.slotNumber,
      }
    });
  } catch (error) {
    console.error("Error fetching signature:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch signature",
      error: error.message
    });
  }
};

/**
 * Update signature for an SMTP account
 * PUT /api/smtp/slot/:slotNumber/signature
 * Body: { signature: '<html>...</html>' }
 */
const updateSignature = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slotNumber } = req.params;
    const { signature } = req.body;

    const smtpAccount = await getSlotByNumber(userId, parseInt(slotNumber));

    if (!smtpAccount) {
      return res.status(404).json({
        success: false,
        message: "SMTP account not found"
      });
    }

    // Only allow signature for verified accounts
    if (!smtpAccount.isVerified || smtpAccount.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: "Signature can only be set for verified and active accounts"
      });
    }

    smtpAccount.signature = signature || null;
    await smtpAccount.save();

    return res.status(200).json({
      success: true,
      message: "Signature updated successfully",
      data: {
        signature: smtpAccount.signature,
        slotNumber: smtpAccount.slotNumber,
      }
    });
  } catch (error) {
    console.error("Error updating signature:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update signature",
      error: error.message
    });
  }
};

/**
 * Delete signature for an SMTP account
 * DELETE /api/smtp/slot/:slotNumber/signature
 */
const deleteSignature = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slotNumber } = req.params;

    const smtpAccount = await getSlotByNumber(userId, parseInt(slotNumber));

    if (!smtpAccount) {
      return res.status(404).json({
        success: false,
        message: "SMTP account not found"
      });
    }

    smtpAccount.signature = null;
    await smtpAccount.save();

    return res.status(200).json({
      success: true,
      message: "Signature deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting signature:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete signature",
      error: error.message
    });
  }
};

module.exports = {
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
};