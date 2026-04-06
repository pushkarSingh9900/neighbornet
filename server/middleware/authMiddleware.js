const jwt = require("jsonwebtoken");

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

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
  isAdminEmail
};
