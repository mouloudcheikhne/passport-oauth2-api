const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const router = express.Router();

const User = require("../models/User");
const { signToken } = require("../utils/jwt");
const { FRONTEND_URL } = require("../config");

// POST /auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashed,
    });

    const token = signToken({ id: user._id });
    return res.status(201).json({ token, user: user.toJSON() });
  } catch (err) {
    console.error("Signup error", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = signToken({ id: user._id });
    return res.json({ token, user: user.toJSON() });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /auth/google -> redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// GET /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/login?error=oauth",
  }),
  (req, res) => {
    // passport sets req.user
    const user = req.user;
    try {
      const token = signToken({ id: user._id });

      return res.json({ token, user: user.toJSON() });
    } catch (err) {
      console.error("Google callback error", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

module.exports = router;
