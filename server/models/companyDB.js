const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minLength: [2, "Company name must be at least 2 characters long"],
      //unique: true,
    },
    companyWebsite: {
      type: String,
      //required: true,
      //unique: true,
      trim: true,
      lowercase: true,
    },
    companyCountry: {
      type: String,
      //required: true,
    },
    companyAddress: {
      type: String,
      //required: true,
    },
    companyEmail: {
      type: String,
      //required: true,
      //unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: (props) => `"${props.value}" is not a valid email address!`,
      }
    },
    companyPhone: {
      type: String,
      //required: true,
      //unique: true,
    },
    companyProductGroup: {
      type: [String],
      //required: true,
    },
    companyContactPersonName: {
      type: String,
      //required: true,
    },
    companyContactPersonPhone: {
      type: String,
      //required: true,
    },
    companyNotes: {
      type: String,
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
