const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email = "") {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication token is required" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "neighbornet-student-project-secret"
    );

    req.user = {
      ...decoded,
      role: isAdminEmail(decoded.email) ? "admin" : "student"
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function loadCurrentUser(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select(
      "name first_name last_name email status warning_count moderation_reason"
    );

    if (!user) {
      return res.status(401).json({ message: "User account not found" });
    }

    req.currentUser = {
      ...user.toObject(),
      role: isAdminEmail(user.email) ? "admin" : "student",
      status: user.status || "active",
      warning_count: user.warning_count || 0,
      moderation_reason: user.moderation_reason || ""
    };

    next();
  } catch (err) {
    return res.status(500).json({ message: "Could not load current user" });
  }
}

function requireActiveUser(req, res, next) {
  if (!req.currentUser) {
    return res.status(401).json({ message: "User account is required" });
  }

  if (req.currentUser.status === "banned") {
    return res.status(403).json({
      message:
        req.currentUser.moderation_reason ||
        "Your account has been restricted from posting new content.",
      code: "ACCOUNT_BANNED"
    });
  }

  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}

module.exports = {
  authenticateToken,
  loadCurrentUser,
  requireActiveUser,
  requireAdmin,
  isAdminEmail
};
