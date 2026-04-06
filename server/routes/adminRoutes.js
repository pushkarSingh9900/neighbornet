const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");
const Issue = require("../models/Issue");
const Property = require("../models/Property");
const Review = require("../models/Review");

router.use(authenticateToken, requireAdmin);

router.get("/dashboard", async (req, res) => {
  try {
    const [properties, reviews, issues] = await Promise.all([
      Property.find().sort({ createdAt: -1 }),
      Review.find().populate("property", "area").sort({ createdAt: -1 }),
      Issue.find().populate("property", "area").sort({ createdAt: -1 })
    ]);

    res.json({
      summary: {
        properties: properties.length,
        reviews: reviews.length,
        openIssues: issues.filter((issue) => issue.status !== "resolved").length,
        resolvedIssues: issues.filter((issue) => issue.status === "resolved").length
      },
      properties,
      reviews,
      issues
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load admin dashboard" });
  }
});

router.patch("/issues/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid issue id" });
    }

    if (!["open", "reviewing", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid issue status" });
    }

    const issue = await Issue.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("property", "area");

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json({ message: "Issue status updated", issue });
  } catch (err) {
    res.status(500).json({ message: "Could not update issue status" });
  }
});

router.delete("/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review id" });
    }

    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Could not remove review" });
  }
});

router.delete("/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid property id" });
    }

    const deletedProperty = await Property.findByIdAndDelete(id);

    if (!deletedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    await Promise.all([
      Review.deleteMany({ property: id }),
      Issue.deleteMany({ property: id })
    ]);

    res.json({ message: "Property and related content removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Could not remove property" });
  }
});

module.exports = router;
