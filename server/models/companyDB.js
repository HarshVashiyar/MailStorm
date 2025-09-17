const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      //unique: true,
    },
    companyWebsite: {
      type: String,
      //required: true,
      //unique: true,
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
    }
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
