const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { authenticateToken, loadCurrentUser, requireActiveUser } = require("../middleware/authMiddleware");
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

function getUserDisplayName(user) {
  return (
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.name ||
    user?.email ||
    "Lakehead Student"
  );
}

router.post("/add", authenticateToken, loadCurrentUser, requireActiveUser, async (req, res) => {
  try {
    const { property, issue_type, description } = req.body;

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
      reported_by: getUserDisplayName(req.currentUser),
      reporter: req.currentUser._id,
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
