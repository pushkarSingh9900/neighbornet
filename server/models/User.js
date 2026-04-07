const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    trim: true
  },
  last_name: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "warned", "banned"],
    default: "active"
  },
  warning_count: {
    type: Number,
    default: 0
  },
  moderation_reason: {
    type: String,
    default: "",
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
