const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  recipient: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);
