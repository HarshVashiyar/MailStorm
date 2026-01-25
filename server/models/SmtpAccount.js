const mongoose = require('mongoose');
const crypto = require('crypto');

const smtpAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "User ID is required!"],
      index: true,
    },
    slotNumber: {
      type: Number,
      required: [true, "Slot number is required!"],
      min: [1, "Slot number must be between 1 and 5!"],
      max: [5, "Slot number must be between 1 and 5!"],
    },
    provider: {
      type: String,
      required: [true, "Provider is required!"],
      enum: {
        values: ["gmail", "outlook", "yahoo", "custom"],
        message: "Provider must be one of: gmail, outlook, yahoo, custom"
      },
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: "Invalid email address!"
      },
    },
    authType: {
      type: String,
      required: [true, "Authentication type is required!"],
      enum: {
        values: ["oauth", "password"],
        message: "Auth type must be either 'oauth' or 'password'"
      },
    },
    // For OAuth (Gmail, Outlook, Yahoo)
    oauthTokens: {
      accessToken: {
        type: String,
        default: null,
      },
      refreshToken: {
        type: String,
        default: null,
      },
      tokenExpiry: {
        type: Date,
        default: null,
      },
    },
    // For Custom SMTP (password-based)
    smtpConfig: {
      host: {
        type: String,
        trim: true,
        default: null,
      },
      port: {
        type: Number,
        min: [1, "Port must be between 1 and 65535"],
        max: [65535, "Port must be between 1 and 65535"],
        default: null,
      },
      secure: {
        type: Boolean, // true for 465, false for other ports
        default: true,
      },
      encryptedPassword: {
        type: String,
        default: null,
      },
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "error", "needs_reauth"],
        message: "Status must be one of: active, inactive, error, needs_reauth"
      },
      default: "active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Usage tracking
    emailsSentToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastResetDate: {
      type: Date,
      default: Date.now,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    totalEmailsSent: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Daily limit based on provider
    dailyLimit: {
      type: Number,
      default: function() {
        switch(this.provider) {
          case 'gmail': return 500;
          case 'outlook': return 300;
          case 'yahoo': return 500;
          case 'custom': return 1000;
          default: return 500;
        }
      },
    },
    errorLog: {
      lastError: {
        type: String,
        default: null,
      },
      lastErrorAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

// Compound index to ensure one slot per user
smtpAccountSchema.index({ userId: 1, slotNumber: 1 }, { unique: true });

// Encryption constants
const ENCRYPTION_KEY = process.env.SMTP_ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-cbc';

// Encrypt sensitive data
smtpAccountSchema.methods.encryptData = function(text) {
  if (!text) return null;
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
};

// Decrypt sensitive data
smtpAccountSchema.methods.decryptData = function(encryptedText) {
  if (!encryptedText) return null;
  
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Pre-save hook to encrypt sensitive fields
smtpAccountSchema.pre('save', function(next) {
  const account = this;
  
  try {
    // Only encrypt if the token exists and is a string
    if (account.isModified('oauthTokens.accessToken') && account.oauthTokens?.accessToken && typeof account.oauthTokens.accessToken === 'string') {
      account.oauthTokens.accessToken = account.encryptData(account.oauthTokens.accessToken);
    }
    
    if (account.isModified('oauthTokens.refreshToken') && account.oauthTokens?.refreshToken && typeof account.oauthTokens.refreshToken === 'string') {
      account.oauthTokens.refreshToken = account.encryptData(account.oauthTokens.refreshToken);
    }
    
    if (account.isModified('smtpConfig.encryptedPassword') && account.smtpConfig?.encryptedPassword && typeof account.smtpConfig.encryptedPassword === 'string') {
      if (!account.smtpConfig.encryptedPassword.includes(':')) {
        account.smtpConfig.encryptedPassword = account.encryptData(account.smtpConfig.encryptedPassword);
      }
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

const SmtpAccount = mongoose.model('SmtpAccount', smtpAccountSchema);
module.exports = SmtpAccount;