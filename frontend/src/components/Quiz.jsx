import { useMemo, useState } from "react";
import { CircleCheck, CircleX, RotateCcw, RefreshCw, ListChecks } from "lucide-react";
import "./Quiz.css";
import "./QuizSaved.css";

const LETTERS = ["A", "B", "C", "D"];

// State resets when a different session opens because the parent passes a `key`.
function Quiz({ questions, savedProgress, onRoundComplete }) {
  const allIds = useMemo(() => questions.map((q) => q.id), [questions]);
  const byId = useMemo(
    () => Object.fromEntries(questions.map((q) => [q.id, q])),
    [questions]
  );

  const [deckIds, setDeckIds] = useState(allIds); // questions in the current round
  const [isRetry, setIsRetry] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null); // option picked but not yet submitted
  const [answers, setAnswers] = useState({}); // questionId -> { selected, correct }
  const [showResults, setShowResults] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Saved incorrect questions from an earlier visit (ignoring ids that no longer exist).
  const savedIncorrect = (savedProgress?.incorrectIds ?? []).filter((id) => byId[id]);
  const savedScore = savedProgress?.fullScore ?? null;

  // Empty state: nothing to answer.
  if (questions.length === 0) {
    return (
      <section className="quiz" aria-label="Quiz">
        <div className="quiz-empty">
          <ListChecks size={28} />
          <p>No quiz questions in this study set.</p>
        </div>
      </section>
    );
  }

  const deck = deckIds.map((id) => byId[id]).filter(Boolean);
  const current = deck[index];
  const answer = answers[current.id];
  const isSubmitted = Boolean(answer);
  const isLast = index === deck.length - 1;

  const answeredCount = deck.filter((q) => answers[q.id]).length;
  const correctCount = deck.filter((q) => answers[q.id]?.correct).length;
  const wrongQuestions = deck.filter((q) => answers[q.id] && !answers[q.id].correct);
  const percentage = Math.round((correctCount / deck.length) * 100);

  const resetPosition = () => {
    setIndex(0);
    setSelected(null);
    setShowResults(false);
  };

  const submit = () => {
    if (selected === null || isSubmitted) return;
    setBannerDismissed(true);
    setAnswers((prev) => ({
      ...prev,
      [current.id]: { selected, correct: selected === current.correctAnswer },
    }));
  };

  const next = () => {
    if (isLast) {
      // Round finished: report it so it can be saved.
      onRoundComplete?.({
        correct: correctCount,
        total: deck.length,
        percentage,
        incorrectIds: wrongQuestions.map((q) => q.id),
        isRetry,
      });
      setShowResults(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  };

  const startRetry = () => {
    const wrongIds = wrongQuestions.map((q) => q.id);
    // Clear the wrong answers so these questions must be answered again.
    setAnswers((prev) => {
      const nextAnswers = { ...prev };
      wrongIds.forEach((id) => delete nextAnswers[id]);
      return nextAnswers;
    });
    setDeckIds(wrongIds);
    setIsRetry(true);
    resetPosition();
  };

  // Start a round with the questions missed in an earlier visit.
  const practiceSaved = () => {
    setBannerDismissed(true);
    setDeckIds(savedIncorrect);
    setIsRetry(true);
    resetPosition();
  };

  const restart = () => {
    setAnswers({});
    setDeckIds(allIds);
    setIsRetry(false);
    resetPosition();
  };

  const header = (
    <div className="quiz-header">
      <h2>
        <ListChecks size={20} />
        Quiz
      </h2>
      {isRetry && <span className="retest-badge">Retrying missed questions</span>}
    </div>
  );

  /* ---------- Results view ---------- */

  if (showResults) {
    const message =
      percentage === 100
        ? "Perfect score!"
        : percentage >= 70
          ? "Good job. Review the ones you missed below."
          : "Keep practicing. Retrying the missed questions is a good next step.";

    return (
      <section className="quiz" aria-label="Quiz results">
        {header}

        <div className="quiz-results" role="status">
          <p className="score-percent">{percentage}%</p>
          <p className="score-detail">
            {correctCount} of {deck.length} correct{isRetry ? " in this retry round" : ""}
          </p>
          <p className="score-message">{message}</p>

          <div className="results-actions">
            {wrongQuestions.length > 0 && (
              <button type="button" className="generate-button compact" onClick={startRetry}>
                <RotateCcw size={16} />
                Retry incorrect ({wrongQuestions.length})
              </button>
            )}
            <button type="button" className="secondary-button" onClick={restart}>
              <RefreshCw size={16} />
              Restart quiz
            </button>
          </div>
        </div>

        {wrongQuestions.length > 0 && (
          <div className="review-list">
            <h3>Questions to review</h3>
            <ul>
              {wrongQuestions.map((q) => (
                <li key={q.id}>
                  <p className="review-question">{q.question}</p>
                  <p className="review-answer">
                    Correct answer: {LETTERS[q.correctAnswer]}. {q.options[q.correctAnswer]}
                  </p>
                  <p className="review-explanation">{q.explanation}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    );
  }

  /* ---------- Question view ---------- */

  const chosen = isSubmitted ? answer.selected : selected;
  const showBanner = !bannerDismissed && (savedScore || savedIncorrect.length > 0);

  return (
    <section className="quiz" aria-label="Quiz">
      {header}

      {showBanner && (
        <div className="quiz-saved">
          <span>
            {savedScore
              ? `Last score: ${savedScore.percentage}% (${savedScore.correct}/${savedScore.total})`
              : "Saved progress found"}
          </span>
          {savedIncorrect.length > 0 && (
            <button type="button" className="secondary-button" onClick={practiceSaved}>
              <RotateCcw size={16} />
              Practice {savedIncorrect.length} missed
            </button>
          )}
        </div>
      )}

      <div className="quiz-meta">
        <span>Question {index + 1} of {deck.length}</span>
        <span>{correctCount} correct so far</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={deck.length}
        aria-valuenow={answeredCount}
      >
        <div
          className="progress-fill"
          style={{ width: `${(answeredCount / deck.length) * 100}%` }}
        />
      </div>

      <span className={`quiz-difficulty difficulty-${current.difficulty}`}>
        {current.difficulty}
      </span>
      <h3 className="quiz-question">{current.question}</h3>

      <fieldset className="quiz-options" disabled={isSubmitted} aria-label="Answer options">
        {current.options.map((option, i) => {
          let state = "";
          if (isSubmitted) {
            if (i === current.correctAnswer) state = " option-correct";
            else if (i === answer.selected) state = " option-wrong";
          } else if (i === selected) {
            state = " option-selected";
          }

          return (
            <label key={i} className={`quiz-option${state}`}>
              <input
                type="radio"
                name={`question-${current.id}`}
                checked={chosen === i}
                onChange={() => setSelected(i)}
              />
              <span className="option-letter">{LETTERS[i]}</span>
              <span className="option-text">{option}</span>
            </label>
          );
        })}
      </fieldset>

      {isSubmitted && (
        <div
          className={answer.correct ? "quiz-feedback feedback-correct" : "quiz-feedback feedback-wrong"}
          role="status"
        >
          <strong>
            {answer.correct ? (
              <>
                <CircleCheck size={18} /> Correct!
              </>
            ) : (
              <>
                <CircleX size={18} /> Not quite. The correct answer is {LETTERS[current.correctAnswer]}.
              </>
            )}
          </strong>
          <p>{current.explanation}</p>
        </div>
      )}

      <div className="quiz-actions">
        {!isSubmitted ? (
          <button
            type="button"
            className="generate-button compact"
            onClick={submit}
            disabled={selected === null}
          >
            Submit answer
          </button>
        ) : (
          <button type="button" className="generate-button compact" onClick={next}>
            {isLast ? "See results" : "Next question"}
          </button>
        )}
      </div>
    </section>
  );
}

export default Quiz;