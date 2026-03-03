const SmtpAccount = require('../models/SmtpAccount');

/**
 * Get available slot numbers for a user (slots 1-5 that aren't used)
 * @param {String} userId - User's ObjectId
 * @returns {Promise<Array>} Array of available slot numbers
 */
const getAvailableSlotNumbers = async (userId) => {
  const usedSlots = await SmtpAccount.find({ userId }).select('slotNumber');
  const usedNumbers = usedSlots.map(slot => slot.slotNumber);

  const allSlots = [1, 2, 3, 4, 5];
  return allSlots.filter(num => !usedNumbers.includes(num));
};

/**
 * Check if account can send email (within daily limit and active)
 * @param {Object} smtpAccount - The SMTP account document
 * @returns {Boolean} True if can send, false otherwise
 */
const canSendEmail = (smtpAccount) => {
  // Reset daily counter if needed
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastReset = new Date(smtpAccount.lastResetDate);
  lastReset.setHours(0, 0, 0, 0);

  let emailsSentToday = smtpAccount.emailsSentToday;
  if (today > lastReset) {
    emailsSentToday = 0;
  }

  return smtpAccount.status === 'active' &&
    smtpAccount.isVerified &&
    emailsSentToday < smtpAccount.dailyLimit;
};

/**
 * Increment email count and update usage stats
 * @param {Object} smtpAccount - The SMTP account document
 * @param {Number} count - Number of emails sent (default 1)
 * @returns {Promise<Object>} Updated account
 */
const incrementEmailCount = async (smtpAccount, count = 1) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastReset = new Date(smtpAccount.lastResetDate);
  lastReset.setHours(0, 0, 0, 0);

  const isNewDay = today > lastReset;

  if (isNewDay) {
    // New day: reset the counter and set it directly to `count` (not $inc from stale value)
    return await SmtpAccount.findByIdAndUpdate(smtpAccount._id, {
      $set: {
        emailsSentToday: count,
        lastResetDate: new Date(),
        lastUsedAt: new Date(),
      },
      $inc: { totalEmailsSent: count },
    });
  }

  // Same day: atomically increment — race-condition safe
  return await SmtpAccount.findByIdAndUpdate(smtpAccount._id, {
    $inc: { emailsSentToday: count, totalEmailsSent: count },
    $set: { lastUsedAt: new Date() },
  });
};

module.exports = {
  getAvailableSlotNumbers,
  canSendEmail,
  incrementEmailCount,
};