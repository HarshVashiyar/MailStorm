const mongoose = require("mongoose");

const listSchema = new mongoose.Schema(
  {
    listName: {
      type: String,
      required: true,
      unique: true,
    },
    listItems: {
      type: [
        {
          email: {
            type: String,
            required: true,
            //unique: true,
          },
          contactName: {
            type: String,
            //required: true,
          }
        },
      ],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

const List = mongoose.model("List", listSchema);
module.exports = List;
