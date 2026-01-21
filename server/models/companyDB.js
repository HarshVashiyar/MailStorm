const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      //unique: true,
      trim: true,
      minLength: 3,
      maxLength: 100,
    },
    companyWebsite: {
      type: String,
      //required: true,
      //unique: true,
      trim: true,
      minLength: 3,
      maxLength: 100,
    },
    companyCountry: {
      type: String,
      //required: true,
      trim: true,
      minLength: 3,
      maxLength: 100,
    },
    companyAddress: {
      type: String,
      //required: true,
      trim: true,
      minLength: 3,
      maxLength: 300,
    },
    companyEmail: {
      type: String,
      //required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: "Invalid! It must be of the form user@example.com!",
      },
      minLength: 5,
      maxLength: 100,
    },
    companyPhone: {
      type: String,
      //required: true,
      //unique: true,
      trim: true,
      minLength: 5,
      maxLength: 20,
    },
    companyProductGroup: {
      type: [String],
      //required: true,
      trim: true,
    },
    companyContactPersonName: {
      type: String,
      //required: true,
      trim: true,
      minLength: 3,
      maxLength: 100,
    },
    companyContactPersonPhone: {
      type: String,
      //required: true,
      trim: true,
      minLength: 5,
      maxLength: 20,
    },
    companyNotes: {
      type: String,
      //required: true,
      trim: true,
    },
    history: [
      {
        lastSent: {
          type: Date,
        },
        subject: {
          type: String,
        },
      },
    ],
    hasProcurementTeam: {
      type: Boolean,
      required: true,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

companySchema.pre("save", function (next) {
  this.history.sort((a, b) => new Date(b.lastSent) - new Date(a.lastSent));
  next();
});

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
