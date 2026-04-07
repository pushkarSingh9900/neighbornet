const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const {
  authenticateToken,
  isAdminEmail,
  loadCurrentUser
} = require("../middleware/authMiddleware");
const User = require("../models/User");

const LAKEHEAD_EMAIL_DOMAIN = "@lakeheadu.ca";

function isLakeheadEmail(email = "") {
  return email.trim().toLowerCase().endsWith(LAKEHEAD_EMAIL_DOMAIN);
}

function getUserNames(user) {
  const fullNameFromFields = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const fallbackName = user.name?.trim() || "";
  const fullName = fullNameFromFields || fallbackName || user.email;
  const [derivedFirstName = ""] = fullName.split(" ");
  const derivedLastName = fullName.split(" ").slice(1).join(" ");

  return {
    fullName,
    firstName: user.first_name?.trim() || derivedFirstName,
    lastName: user.last_name?.trim() || derivedLastName,
    status: user.status || "active",
    warningCount: user.warning_count || 0,
    moderationReason: user.moderation_reason || ""
  };
}

function buildAuthResponse(user) {
  const role = isAdminEmail(user.email) ? "admin" : "student";
  const { fullName, firstName, lastName, status, warningCount, moderationReason } = getUserNames(user);

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      name: fullName,
      role
    },
    process.env.JWT_SECRET || "neighbornet-student-project-secret",
    { expiresIn: "7d" }
  );

  return {
    message: "Authentication successful",
    token,
    user: {
      id: user._id,
      name: fullName,
      first_name: firstName,
      last_name: lastName,
      email: user.email,
      status,
      warning_count: warningCount,
      moderation_reason: moderationReason,
      role
    }
  };
}

router.post("/signup", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "First name, last name, email, and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedFirstName = first_name.trim();
    const normalizedLastName = last_name.trim();

    if (!isLakeheadEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Only @lakeheadu.ca email addresses are allowed" });
    }

    if (!normalizedFirstName || !normalizedLastName) {
      return res.status(400).json({ message: "First name and last name are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name: normalizedFirstName,
      last_name: normalizedLastName,
      name: `${normalizedFirstName} ${normalizedLastName}`.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    res.status(201).json(buildAuthResponse(user));
  } catch (err) {
    res.status(500).json({ message: "Could not create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isLakeheadEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Use your @lakeheadu.ca email to sign in" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found for this email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.json(buildAuthResponse(user));
  } catch (err) {
    res.status(500).json({ message: "Could not log in" });
  }
});

router.get("/me", authenticateToken, loadCurrentUser, async (req, res) => {
  try {
    res.json(buildAuthResponse(req.currentUser));
  } catch (err) {
    res.status(500).json({ message: "Could not load account details" });
  }
});

module.exports = router;
