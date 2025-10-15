const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const emailProviderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  providerName: {
    type: String,
    required: true,
    enum: ["gmail", "outlook", "custom"],
  },
  emailAddress: {
    type: String,
    required: true,
  },
  smtpHost: { type: String },
  smtpPort: { type: Number },
  oauth: {
    clientId: String,
    clientSecret: String,
    refreshToken: String,
    accessToken: String,
    tokenExpiry: Date,
  },
  encryptedPassword: { type: String }, // for SMTP-based credentials
}, { timestamps: true });

// Hash password before save (for SMTP accounts)
emailProviderSchema.pre("save", async function (next) {
  if (this.isModified("encryptedPassword") && this.encryptedPassword) {
    const salt = await bcrypt.genSalt(12);
    this.encryptedPassword = await bcrypt.hash(this.encryptedPassword, salt);
  }
  next();
});

const EmailProvider = mongoose.model("EmailProvider", emailProviderSchema);
module.exports = EmailProvider;