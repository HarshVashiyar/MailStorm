const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required!"],
      trim: true,
      minLength: [3, "Company name must be at least 3 characters long!"],
      maxLength: [100, "Company name must be at most 100 characters long!"],
      //unique: true,
    },
    companyWebsite: {
      type: String,
      //required: true,
      //unique: true,
      trim: true,
      minLength: [3, "Website URL must be at least 3 characters long!"],
      maxLength: [100, "Website URL must be at most 100 characters long!"],
    },
    companyCountry: {
      type: String,
      //required: true,
      trim: true,
      minLength: [3, "Country name must be at least 3 characters long!"],
      maxLength: [100, "Country name must be at most 100 characters long!"],
    },
    companyAddress: {
      type: String,
      //required: true,
      trim: true,
      minLength: [3, "Address must be at least 3 characters long!"],
      maxLength: [300, "Address must be at most 300 characters long!"],
    },
    companyEmail: {
      type: String,
      //required: true,
      //unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: "Invalid! It must be of the form user@example.com!",
      },
      minLength: [5, "Email must be at least 5 characters long!"],
      maxLength: [100, "Email cannot exceed 100 characters long!"],
    },
    companyPhone: {
      type: String,
      //required: true,
      //unique: true,
      trim: true,
      minLength: [5, "Phone number must be at least 5 characters long!"],
      maxLength: [20, "Phone number cannot exceed 20 characters long!"],
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
      minLength: [3, "Contact person name must be at least 3 characters long!"],
      maxLength: [100, "Contact person name must be at most 100 characters long!"],
    },
    companyContactPersonPhone: {
      type: String,
      //required: true,
      trim: true,
      minLength: [5, "Contact person phone must be at least 5 characters long!"],
      maxLength: [20, "Contact person phone cannot exceed 20 characters long!"],
    },
    companyNotes: {
      type: String,
      //required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
