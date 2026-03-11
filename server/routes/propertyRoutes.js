const express = require("express");
const router = express.Router();
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

module.exports = router;