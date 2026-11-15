import { z } from "zod";
import { studySetSchema } from "../schemas/studySet";

export const STORAGE_KEY = "algoprep:sessions:v1";

const scoreSchema = z.object({
  correct: z.number().int().min(0),
  total: z.number().int().min(1),
  percentage: z.number().min(0).max(100),
});

const sessionSchema = z.object({
  id: z.string().min(1),
  updatedAt: z.string().min(1),
  data: studySetSchema,
  progress: z.object({
    ratings: z.record(z.string(), z.enum(["easy", "medium", "hard"])),
    quiz: z.object({
      attempts: z.number().int().min(0),
      fullScore: scoreSchema.nullable(),
      incorrectIds: z.array(z.string()),
    }),
  }),
});

// Never throws. Corrupt JSON gives an empty list; invalid entries are dropped
// individually so one bad session can't take the others down with it.
export function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      const result = sessionSchema.safeParse(item);
      return result.success ? [result.data] : [];
    });
  } catch (err) {
    console.warn("Could not read saved sessions:", err);
    return [];
  }
}

// Never throws (storage can be full or disabled). Returns whether it worked.
export function saveSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return true;
  } catch (err) {
    console.warn("Could not save sessions:", err);
    return false;
  }
}