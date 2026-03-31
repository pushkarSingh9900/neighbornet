const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

const LAKEHEAD_EMAIL_DOMAIN = "@lakeheadu.ca";

function isLakeheadEmail(email = "") {
  return email.trim().toLowerCase().endsWith(LAKEHEAD_EMAIL_DOMAIN);
}

function buildAuthResponse(user) {
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email
    },
    process.env.JWT_SECRET || "neighbornet-student-project-secret",
    { expiresIn: "7d" }
  );

  return {
    message: "Authentication successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  };
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isLakeheadEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Only @lakeheadu.ca email addresses are allowed" });
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
      name: name.trim(),
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

module.exports = router;
