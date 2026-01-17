const mongoose = require("mongoose");

const listSchema = new mongoose.Schema(
  {
    listName: {
      type: String,
      // unique: true,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 100,
    },
    listItems: [
      {
        company: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Company",
          required: true,
        },
        contactEmail: String,
        contactName: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

listSchema.index({ createdBy: 1, listName: 1 }, { unique: true });

const List = mongoose.model("List", listSchema);
module.exports = List;
