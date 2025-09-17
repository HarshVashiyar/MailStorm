const mongoose = require("mongoose");
const { createHmac, randomBytes } = require("node:crypto");
const { createTokenForUser, setAuthCookie } = require("../utilities/userUtil");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: false,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["User", "Admin"],
      default: "User",
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }

  const salt = randomBytes(16).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  user.password = hashedPassword;
  user.salt = salt;
  next();
});

userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    const user = await this.findOne({ email });

    if (!user) {
      const error = new Error("User Not Found");
      error.statusCode = 404;
      throw error;
    }

    if (!user.salt) throw new Error("Salt is missing for the user");

    const userProvidedHash = createHmac("sha256", user.salt)
      .update(password)
      .digest("hex");

    if (user.password !== userProvidedHash)
      throw new Error("Incorrect Password");

    const token = createTokenForUser(user);
    return token;
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
