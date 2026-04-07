const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { authenticateToken, loadCurrentUser, requireActiveUser } = require("../middleware/authMiddleware");
const Property = require("../models/Property");
const Review = require("../models/Review");

function getUserDisplayName(user) {
  return (
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.name ||
    user?.email ||
    "Lakehead Student"
  );
}

// Add Review
router.post("/add", authenticateToken, loadCurrentUser, requireActiveUser, async (req, res) => {
  try {
    const { property, rating, comment } = req.body;

    if (!property || !rating || !comment) {
      return res.status(400).json({ message: "Property, rating, and comment are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(property)) {
      return res.status(400).json({ message: "Invalid property id" });
    }

    const parsedRating = Number(rating);

    if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const propertyExists = await Property.findById(property);

    if (!propertyExists) {
      return res.status(404).json({ message: "Property not found" });
    }

    const review = new Review({
      property,
      reviewer_name: getUserDisplayName(req.currentUser),
      reviewer: req.currentUser._id,
      rating: parsedRating,
      comment
    });

    await review.save();

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: "Could not submit review" });
  }
});

// Get Reviews For One Property
router.get("/property/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: "Invalid property id" });
    }

    const reviews = await Review.find({ property: propertyId }).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Could not load reviews" });
  }
});

module.exports = router;
