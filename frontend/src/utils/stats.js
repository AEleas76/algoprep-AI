// Derives the dashboard numbers from saved sessions.
export function computeStats(sessions) {
  let correct = 0;
  let total = 0;
  let easyCards = 0;

  sessions.forEach((s) => {
    const score = s.progress.quiz.fullScore;
    if (score) {
      correct += score.correct;
      total += score.total;
    }
    easyCards += Object.values(s.progress.ratings).filter((r) => r === "easy").length;
  });

  return {
    topics: sessions.length,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : null,
    easyCards,
  };
}