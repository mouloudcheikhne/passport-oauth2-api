const mongoose = require("mongoose");
const { MONGO_URI } = require("./index");

async function connectDB() {
  if (!MONGO_URI) {
    console.error("MONGO_URI not set in environment");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
