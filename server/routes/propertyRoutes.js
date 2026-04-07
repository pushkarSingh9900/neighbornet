const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Property = require("../models/Property");
// Add Property
router.post("/add", async (req, res) => {
  try {
    const imageUrls = Array.isArray(req.body?.image_urls)
      ? req.body.image_urls
          .filter((imageUrl) => typeof imageUrl === "string" && imageUrl.trim())
          .slice(0, 4)
      : [];

    const property = new Property({
      area: req.body?.area,
      rent_range: req.body?.rent_range,
      distance_to_campus: req.body?.distance_to_campus,
      property_type: req.body?.property_type,
      created_by: req.body?.created_by,
      image_urls: imageUrls
    });

    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: "Could not add property" });
  }
});

// Get All Properties
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Could not load properties" });
  }
});

// Get Single Property
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid property id" });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json(property);
  } catch (err) {
    res.status(500).json({ message: "Could not load property" });
  }
});

module.exports = router;
