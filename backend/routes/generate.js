const express = require("express");
const AppError = require("../utils/AppError");
const { generateRequestSchema, formatZodIssues } = require("../schemas");
const { generateStudySet } = require("../services/geminiService");

const router = express.Router();

// Express 5 forwards errors thrown/rejected in async handlers to the error middleware.
router.post("/", async (req, res) => {
  const parsed = generateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, "INVALID_REQUEST", "Please check your input.", formatZodIssues(parsed.error));
  }

  const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 45000;
  const controller = new AbortController();

  // Abort the Gemini call if it takes too long...
  const timer = setTimeout(() => {
    controller.abort(new AppError(504, "AI_TIMEOUT", "The AI took too long to respond. Please try again."));
  }, timeoutMs);

  // ...or if the browser cancels/disconnects before we respond.
  res.on("close", () => {
    if (!res.writableFinished) {
      controller.abort(new AppError(499, "CLIENT_CLOSED", "Client closed the request."));
    }
  });

  try {
    const data = await generateStudySet(parsed.data, controller.signal);
    res.status(200).json({ success: true, data });
  } finally {
    clearTimeout(timer);
  }
});

module.exports = router;