require("dotenv").config();
const express = require("express");
const passport = require("passport");
const cors = require("cors");

const { connectDB } = require("./src/config/db");
const { PORT } = require("./src/config");

// initialize app
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// connect to db
connectDB();

// passport (Google strategy)
require("./src/routes/auth/googleStrategy")(passport);
app.use(passport.initialize());

// routes
app.use("/auth", require("./src/routes/auth"));

// example protected route
const { requireAuth } = require("./src/middleware/auth");
app.get("/protected", requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// health
app.get("/", (req, res) =>
  res.json({ ok: true, now: new Date().toISOString() })
);

const port = PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
