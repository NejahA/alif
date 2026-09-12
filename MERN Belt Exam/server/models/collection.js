const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "required"],
      minlength: [3, "minlength"],
      
      validate: {
        validator(value) {
          return !value.toLowerCase().includes("cake");
        },
        message: "censored",
      },
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Collection = mongoose.model("Collection", CollectionSchema);

module.exports = Collection;
