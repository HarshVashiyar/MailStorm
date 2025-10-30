const mongoose = require("mongoose");

const listSchema = new mongoose.Schema(
  {
    listName: {
      type: String,
      required: [true, "List name is required!"],
      trim: true,
      minLength: [3, "List name must be at least 3 characters long!"],
      maxLength: [100, "List name must be at most 100 characters long!"],
    },
    listItems: {
      type: [
        {
          email: {
            type: String,
            required: [true, "Email is required!"],
            trim: true,
            validate: {
              validator: function(email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
              },
              message: "Invalid! It must be of the form user@example.com!",
            },
          },
          contactName: {
            type: String,
            required: [true, "Contact name is required!"],
            trim: true,
            minLength: [3, "Contact name must be at least 3 characters long!"],
            maxLength: [100, "Contact name must be at most 100 characters long!"],
          }
        },
      ],
      required: [true, "List items are required!"],
    },
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
