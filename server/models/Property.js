const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
  area: {
    type: String,
    required: true
  },
  rent_range: {
    type: String
  },
  distance_to_campus: {
    type: Number
  },
  property_type: {
    type: String
  },
  image_urls: {
    type: [String],
    default: []
  },
  created_by: {
    type: String
  },
  created_by_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Property", PropertySchema);
