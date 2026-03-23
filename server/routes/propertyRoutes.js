const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Property = require("../models/Property");


// Add Property
router.post("/add", async (req, res) => {
  try {
    const property = new Property(req.body);
    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).json(err);
  }
});


// Get All Properties
router.get("/", async (req, res) => {
  const properties = await Property.find();
  res.json(properties);
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
    res.status(500).json(err);
  }
});

module.exports = router;
