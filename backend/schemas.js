const { z } = require("zod");

const FLASHCARD_COUNT = 8;
const QUIZ_COUNT = 5;

const MODES = ["flashcards", "quiz", "both"];
const DIFFICULTIES = ["easy", "medium", "hard"];

const text = (max) => z.string().trim().min(1).max(max);

/* ---------- 1. Incoming request from React ---------- */

const generateRequestSchema = z.object({
  topic: z
    .string({ error: "topic must be a string" })
    .trim()
    .min(3, "topic must be at least 3 characters")
    .max(4000, "topic must be at most 4000 characters"),
  mode: z.enum(MODES, { error: "mode must be one of: flashcards, quiz, both" }),
  difficulty: z
    .enum([...DIFFICULTIES, "mixed"], {
      error: "difficulty must be one of: easy, medium, hard, mixed",
    })
    .default("mixed"),
});

/* ---------- 2. What we expect Gemini to return ---------- */

const flashcardBase = z.object({
  question: text(300),
  answer: text(1200),
  difficulty: z.enum(DIFFICULTIES),
});

const quizBase = z.object({
  question: text(500),
  options: z.array(text(300)).length(4),
  correctAnswer: z.number().int().min(0).max(3), // zero-based index
  explanation: text(1200),
  difficulty: z.enum(DIFFICULTIES),
});

const hasUniqueOptions = (q) =>
  new Set(q.options.map((o) => o.toLowerCase())).size === q.options.length;
const uniqueOptionsRule = { message: "options must be unique", path: ["options"] };

const aiQuizQuestionSchema = quizBase.refine(hasUniqueOptions, uniqueOptionsRule);

// Only require the sections the user asked for.
function buildAiOutputSchema(mode) {
  const shape = { title: text(80) };
  if (mode !== "quiz") shape.flashcards = z.array(flashcardBase).min(3).max(15);
  if (mode !== "flashcards") shape.quiz = z.array(aiQuizQuestionSchema).min(3).max(10);
  return z.object(shape);
}

/* ---------- 3. What React receives (after the server adds ids) ---------- */

const flashcardSchema = flashcardBase.extend({
  id: z.string().min(1),
  topic: z.string().min(1),
});

const quizQuestionSchema = quizBase
  .extend({ id: z.string().min(1) })
  .refine(hasUniqueOptions, uniqueOptionsRule);

const generatedSetSchema = z.object({
  title: z.string().min(1),
  mode: z.enum(MODES),
  difficulty: z.enum([...DIFFICULTIES, "mixed"]),
  flashcards: z.array(flashcardSchema),
  quiz: z.array(quizQuestionSchema),
  generatedAt: z.iso.datetime(),
});

function formatZodIssues(error) {
  return error.issues.map((i) => ({
    field: i.path.join(".") || "(root)",
    message: i.message,
  }));
}

module.exports = {
  FLASHCARD_COUNT,
  QUIZ_COUNT,
  generateRequestSchema,
  buildAiOutputSchema,
  generatedSetSchema,
  formatZodIssues,
};