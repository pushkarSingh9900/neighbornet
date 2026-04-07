const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { authenticateToken, loadCurrentUser, requireActiveUser } = require("../middleware/authMiddleware");
const Property = require("../models/Property");

function normalizeText(value = "") {
  return String(value).trim().toLowerCase();
}

function normalizeDistance(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getUserDisplayName(user) {
  return (
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.name ||
    user?.email ||
    "Lakehead Student"
  );
}

// Add Property
router.post("/add", authenticateToken, loadCurrentUser, requireActiveUser, async (req, res) => {
  try {
    const normalizedArea = normalizeText(req.body?.area);
    const normalizedRentRange = normalizeText(req.body?.rent_range);
    const normalizedPropertyType = normalizeText(req.body?.property_type);
    const normalizedDistance = normalizeDistance(req.body?.distance_to_campus);

    if (!normalizedArea) {
      return res.status(400).json({ message: "Property area or address is required" });
    }

    const imageUrls = Array.isArray(req.body?.image_urls)
      ? req.body.image_urls
          .filter((imageUrl) => typeof imageUrl === "string" && imageUrl.trim())
          .slice(0, 4)
      : [];

    const potentialDuplicates = await Property.find({
      area: new RegExp(`^${escapeRegex(String(req.body?.area).trim())}$`, "i")
    });

    const duplicateProperty = potentialDuplicates.find((property) =>
      normalizeText(property.rent_range) === normalizedRentRange &&
      normalizeText(property.property_type) === normalizedPropertyType &&
      normalizeDistance(property.distance_to_campus) === normalizedDistance
    );

    if (duplicateProperty) {
      return res.status(409).json({
        message: "This property has already been added. You can open the existing listing and leave a review or report instead.",
        propertyId: duplicateProperty._id
      });
    }

    const property = new Property({
      area: String(req.body?.area).trim(),
      rent_range: req.body?.rent_range,
      distance_to_campus: req.body?.distance_to_campus,
      property_type: req.body?.property_type,
      created_by: getUserDisplayName(req.currentUser),
      created_by_user: req.currentUser._id,
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
