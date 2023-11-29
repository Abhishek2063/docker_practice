const mongoose = require("mongoose");

const expanseDetailsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, required: true },
  description: { type: String, maxlength: 100 },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  amount: { type: Number, required: true },
  isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("ExpanseDetails", expanseDetailsSchema);
