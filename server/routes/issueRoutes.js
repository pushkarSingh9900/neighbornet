const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Property = require("../models/Property");
const Issue = require("../models/Issue");

const ALLOWED_ISSUE_TYPES = [
  "mold",
  "pests",
  "heat",
  "noise",
  "safety",
  "maintenance",
  "other"
];

router.post("/add", async (req, res) => {
  try {
    const { property, issue_type, description, reported_by } = req.body;

    if (!property || !issue_type || !description) {
      return res.status(400).json({ message: "Property, issue type, and description are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(property)) {
      return res.status(400).json({ message: "Invalid property id" });
    }

    if (!ALLOWED_ISSUE_TYPES.includes(issue_type)) {
      return res.status(400).json({ message: "Invalid issue type" });
    }

    const propertyExists = await Property.findById(property);

    if (!propertyExists) {
      return res.status(404).json({ message: "Property not found" });
    }

    const issue = new Issue({
      property,
      issue_type,
      description,
      reported_by,
      status: "open"
    });

    await issue.save();

    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ message: "Could not report issue" });
  }
});

router.get("/property/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: "Invalid property id" });
    }

    const issues = await Issue.find({ property: propertyId }).sort({ createdAt: -1 });

    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Could not load issues" });
  }
});

module.exports = router;
