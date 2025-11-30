const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const User = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing or malformed",
      });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id)
      return res.status(401).json({ success: false, message: "Invalid token" });

    const user = await User.findById(decoded.id);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    req.user = user.toJSON();
    next();
  } catch (err) {
    console.error("Auth middleware error", err);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

module.exports = { requireAuth };
