import { useCallback, useEffect, useState } from "react";
import { loadSessions, saveSessions } from "../services/storage";

const MAX_SESSIONS = 20;

// crypto.randomUUID only exists in secure contexts (localhost/https),
// so fall back for testing over a LAN IP on a phone.
function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function newSession(data) {
  return {
    id: makeId(),
    updatedAt: new Date().toISOString(),
    data,
    progress: {
      ratings: {},
      quiz: { attempts: 0, fullScore: null, incorrectIds: [] },
    },
  };
}

// Applies `change` to one session and stamps it as updated.
function updateOne(sessions, id, change) {
  return sessions.map((s) =>
    s.id === id ? { ...change(s), updatedAt: new Date().toISOString() } : s
  );
}

export function useSavedSessions() {
  const [sessions, setSessions] = useState(loadSessions);

  // Persist every change.
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const addSession = useCallback((data) => {
    const session = newSession(data);
    setSessions((prev) => [session, ...prev].slice(0, MAX_SESSIONS));
    return session.id;
  }, []);

  const saveRatings = useCallback((id, ratings) => {
    setSessions((prev) =>
      updateOne(prev, id, (s) => ({
        ...s,
        progress: { ...s.progress, ratings },
      }))
    );
  }, []);

  const recordQuizRound = useCallback((id, round) => {
    setSessions((prev) =>
      updateOne(prev, id, (s) => {
        const quiz = s.progress.quiz;
        return {
          ...s,
          progress: {
            ...s.progress,
            quiz: {
              attempts: quiz.attempts + 1,
              // Retry rounds only cover missed questions, so they don't replace the full score.
              fullScore: round.isRetry
                ? quiz.fullScore
                : {
                    correct: round.correct,
                    total: round.total,
                    percentage: round.percentage,
                  },
              incorrectIds: round.incorrectIds,
            },
          },
        };
      })
    );
  }, []);

  const removeSession = useCallback((id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { sessions, addSession, saveRatings, recordQuizRound, removeSession };
}