require("dotenv").config();

const express = require("express");
const cors = require("cors");
const AppError = require("./utils/AppError");
const generateRouter = require("./routes/generate");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json({ limit: "100kb" }));

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AlgoPrep AI Backend is running!",
  });
});

// API routes
app.use("/api/generate", generateRouter);

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.originalUrl} not found.` },
  });
});

// Central error handler: every failure leaves the server in one consistent shape.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  // body-parser errors (malformed request JSON, oversized body)
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_JSON", message: "Request body is not valid JSON." },
    });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      error: { code: "PAYLOAD_TOO_LARGE", message: "Request is too large. Please shorten your input." },
    });
  }

  console.error("Unexpected error:", err);
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Something went wrong on the server." },
  });
});

// Start server
// Start server
app.listen(PORT, (err) => {
  if (err) {
    console.error(`Failed to start on port ${PORT}:`, err.message);
    process.exit(1);
  }
  console.log(`Server running on http://localhost:${PORT}`);
});