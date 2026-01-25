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
  // Check if we need to reset daily counter
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastReset = new Date(smtpAccount.lastResetDate);
  lastReset.setHours(0, 0, 0, 0);
  
  if (today > lastReset) {
    smtpAccount.emailsSentToday = 0;
    smtpAccount.lastResetDate = new Date();
  }
  
  smtpAccount.emailsSentToday += count;
  smtpAccount.totalEmailsSent += count;
  smtpAccount.lastUsedAt = new Date();
  
  return await smtpAccount.save();
};

module.exports = {
  getAvailableSlotNumbers,
  canSendEmail,
  incrementEmailCount,
};