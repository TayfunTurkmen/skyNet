const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Kolon başlığı gereklidir"],
      trim: true,
      minlength: [1, "Başlık en az 1 karakter olmalıdır"],
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Column", columnSchema);
