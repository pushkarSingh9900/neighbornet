const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true
  },
  issue_type: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  reported_by: {
    type: String,
    trim: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    enum: ["open", "reviewing", "resolved"],
    default: "open"
  }
}, { timestamps: true });

module.exports = mongoose.model("Issue", IssueSchema);
