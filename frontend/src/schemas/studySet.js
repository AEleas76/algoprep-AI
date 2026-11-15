import { z } from "zod";

// Mirrors the backend's final response schema. The server already validates,
// but the frontend never trusts the network (or localStorage) blindly.
const difficulty = z.enum(["easy", "medium", "hard"]);
const text = z.string().min(1);

export const flashcardSchema = z.object({
  id: text,
  question: text,
  answer: text,
  difficulty,
  topic: text,
});

export const quizQuestionSchema = z.object({
  id: text,
  question: text,
  options: z.array(text).length(4),
  correctAnswer: z.number().int().min(0).max(3), // zero-based index
  explanation: text,
  difficulty,
});

export const studySetSchema = z.object({
  title: text,
  mode: z.enum(["flashcards", "quiz", "both"]),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  flashcards: z.array(flashcardSchema),
  quiz: z.array(quizQuestionSchema),
  generatedAt: text,
});