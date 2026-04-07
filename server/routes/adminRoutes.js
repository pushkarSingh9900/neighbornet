const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { authenticateToken, requireAdmin, isAdminEmail } = require("../middleware/authMiddleware");
const Issue = require("../models/Issue");
const Property = require("../models/Property");
const Review = require("../models/Review");
const User = require("../models/User");

router.use(authenticateToken, requireAdmin);

function summarizeIssues(issues) {
  return {
    openIssues: issues.filter((issue) => issue.status === "open").length,
    reviewingIssues: issues.filter((issue) => issue.status === "reviewing").length,
    closedIssues: issues.filter((issue) => issue.status === "resolved").length
  };
}

function summarizeUsers(users) {
  return {
    warnedUsers: users.filter((user) => user.warning_count > 0 && user.status !== "banned").length,
    bannedUsers: users.filter((user) => user.status === "banned").length
  };
}

function serializeUser(user) {
  return {
    _id: user._id,
    name:
      [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
      user.name ||
      user.email,
    email: user.email,
    status: user.status || "active",
    warning_count: user.warning_count || 0,
    moderation_reason: user.moderation_reason || "",
    role: isAdminEmail(user.email) ? "admin" : "student",
    createdAt: user.createdAt
  };
}

router.get("/dashboard", async (req, res) => {
  try {
    const [properties, reviews, issues, users] = await Promise.all([
      Property.find().populate("created_by_user", "name first_name last_name email status warning_count moderation_reason").sort({ createdAt: -1 }),
      Review.find().populate("property", "area").populate("reviewer", "name first_name last_name email status warning_count moderation_reason").sort({ createdAt: -1 }),
      Issue.find().populate("property", "area").populate("reporter", "name first_name last_name email status warning_count moderation_reason").sort({ createdAt: -1 }),
      User.find().sort({ warning_count: -1, createdAt: -1 })
    ]);

    const serializedUsers = users.map(serializeUser);

    res.json({
      summary: {
        properties: properties.length,
        reviews: reviews.length,
        ...summarizeIssues(issues),
        ...summarizeUsers(serializedUsers)
      },
      properties,
      reviews,
      issues,
      users: serializedUsers
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load admin dashboard" });
  }
});

router.patch("/users/:id/warn", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (isAdminEmail(user.email)) {
      return res.status(400).json({ message: "Admin accounts cannot be warned from this dashboard" });
    }

    user.warning_count = (user.warning_count || 0) + 1;

    if (user.status !== "banned") {
      user.status = "warned";
    }

    user.moderation_reason = reason?.trim() || "Admin warning issued for content moderation.";
    await user.save();

    res.json({
      message: "User warned successfully",
      user: serializeUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: "Could not warn user" });
  }
});

router.patch("/users/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (!["active", "banned"].includes(status)) {
      return res.status(400).json({ message: "Invalid user status" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (isAdminEmail(user.email)) {
      return res.status(400).json({ message: "Admin accounts cannot be banned from this dashboard" });
    }

    user.status = status;

    if (status === "banned") {
      user.warning_count = Math.max(user.warning_count || 0, 1);
      user.moderation_reason = reason?.trim() || "Account banned by admin for repeated moderation issues.";
    } else {
      user.moderation_reason = reason?.trim() || "";
    }

    await user.save();

    res.json({
      message: `User status updated to ${status}`,
      user: serializeUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: "Could not update user status" });
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
