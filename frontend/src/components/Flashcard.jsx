import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, RefreshCw, Layers } from "lucide-react";
import "./Flashcard.css";

const RATINGS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

// State resets when a new study set arrives because the parent passes a `key`.
function Flashcard({ cards }) {
  const allIds = useMemo(() => cards.map((c) => c.id), [cards]);
  const cardsById = useMemo(
    () => Object.fromEntries(cards.map((c) => [c.id, c])),
    [cards]
  );

  const [deckIds, setDeckIds] = useState(allIds); // cards in the current round
  const [isRetest, setIsRetest] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState({}); // cardId -> "easy" | "medium" | "hard"

  // Empty state: nothing to study.
  if (cards.length === 0) {
    return (
      <section className="flashcards" aria-label="Flashcards">
        <div className="flashcards-empty">
          <Layers size={28} />
          <p>No flashcards in this study set.</p>
        </div>
      </section>
    );
  }

  const deck = deckIds.map((id) => cardsById[id]).filter(Boolean);
  const current = deck[index] ?? deck[0];

  const counts = { easy: 0, medium: 0, hard: 0 };
  deck.forEach((card) => {
    const r = ratings[card.id];
    if (r) counts[r] += 1;
  });
  const ratedCount = counts.easy + counts.medium + counts.hard;
  const allRated = ratedCount === deck.length;
  const hardIds = deck.filter((c) => ratings[c.id] === "hard").map((c) => c.id);

  const goTo = (i) => {
    setIndex(i);
    setFlipped(false);
  };

  const rate = (value) => {
    setRatings((prev) => ({ ...prev, [current.id]: value }));
  };

  const startRetest = () => {
    // Clear the hard ratings so these cards must be re-rated this round.
    setRatings((prev) => {
      const next = { ...prev };
      hardIds.forEach((id) => delete next[id]);
      return next;
    });
    setDeckIds(hardIds);
    setIsRetest(true);
    goTo(0);
  };

  const restartAll = () => {
    setRatings({});
    setDeckIds(allIds);
    setIsRetest(false);
    goTo(0);
  };

  return (
    <section className="flashcards" aria-label="Flashcards">

      <div className="flashcards-header">
        <h2>
          <Layers size={20} />
          Flashcards
        </h2>
        {isRetest && <span className="retest-badge">Retesting hard cards</span>}
      </div>

      <div className="flashcard-progress">
        <span>Card {index + 1} of {deck.length}</span>
        <span>{ratedCount}/{deck.length} rated</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={deck.length}
        aria-valuenow={index + 1}
      >
        <div
          className="progress-fill"
          style={{ width: `${((index + 1) / deck.length) * 100}%` }}
        />
      </div>

      <button
        type="button"
        className={flipped ? "flashcard flashcard-flipped" : "flashcard"}
        onClick={() => setFlipped((f) => !f)}
      >
        <span className={`difficulty-badge difficulty-${current.difficulty}`}>
          {current.difficulty}
        </span>
        <span className="flashcard-side">{flipped ? "Answer" : "Question"}</span>
        <span className="flashcard-text">
          {flipped ? current.answer : current.question}
        </span>
        <span className="flashcard-hint">
          {flipped ? "Click to see the question" : "Click to reveal the answer"}
        </span>
      </button>

      <div className="rating-row">
        <span className="rating-label">
          {flipped ? "How well did you know it?" : "Flip the card to rate it"}
        </span>
        <div className="rating-buttons">
          {RATINGS.map((r) => {
            const selected = ratings[current.id] === r.value;
            return (
              <button
                key={r.value}
                type="button"
                className={`rating-button rating-${r.value}${selected ? " rating-selected" : ""}`}
                disabled={!flipped}
                aria-pressed={selected}
                onClick={() => rate(r.value)}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flashcard-nav">
        <button
          type="button"
          className="secondary-button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => goTo(index + 1)}
          disabled={index === deck.length - 1}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      {allRated && (
        <div className="flashcard-summary" role="status">
          <strong>{isRetest ? "Retest complete" : "Round complete"}</strong>
          <p>
            Easy {counts.easy} · Medium {counts.medium} · Hard {counts.hard}
          </p>
          <div className="summary-actions">
            {hardIds.length > 0 ? (
              <button
                type="button"
                className="generate-button compact"
                onClick={startRetest}
              >
                <RotateCcw size={16} />
                Retest hard cards ({hardIds.length})
              </button>
            ) : (
              <p className="summary-note">No hard cards left. Nice work!</p>
            )}
            <button type="button" className="secondary-button" onClick={restartAll}>
              <RefreshCw size={16} />
              Restart all cards
            </button>
          </div>
        </div>
      )}

    </section>
  );
}

export default Flashcard;