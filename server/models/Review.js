const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true
  },
  reviewer_name: {
    type: String,
    trim: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Review", ReviewSchema);
