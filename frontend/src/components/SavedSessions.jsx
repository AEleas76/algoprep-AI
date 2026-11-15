import { History, FolderOpen, Trash2 } from "lucide-react";
import "./SavedSessions.css";

const MODE_LABEL = {
  flashcards: "Flashcards",
  quiz: "Quiz",
  both: "Flashcards + Quiz",
};

function formatDate(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function progressSummary(session) {
  const { data, progress } = session;
  const parts = [];

  if (data.flashcards.length > 0) {
    const rated = Object.keys(progress.ratings).length;
    parts.push(`${rated}/${data.flashcards.length} cards rated`);
  }

  if (data.quiz.length > 0) {
    const { fullScore, incorrectIds } = progress.quiz;
    if (fullScore) {
      const review = incorrectIds.length > 0 ? `, ${incorrectIds.length} to review` : "";
      parts.push(`Last score ${fullScore.percentage}%${review}`);
    } else {
      parts.push("Quiz not taken");
    }
  }

  return parts.join(" · ");
}

function SavedSessions({ sessions, activeId, disabled, onOpen, onDelete }) {
  const handleDelete = (session) => {
    if (window.confirm(`Delete "${session.data.title}"? This cannot be undone.`)) {
      onDelete(session.id);
    }
  };

  return (
    <section className="saved-sessions" aria-label="Saved study sessions">

      <div className="saved-header">
        <h2>
          <History size={20} />
          Saved sessions
        </h2>
        <span className="saved-count">{sessions.length}</span>
      </div>

      {sessions.length === 0 ? (
        <p className="saved-empty">
          No saved sessions yet. Generate some study material and it will appear here.
        </p>
      ) : (
        <ul className="saved-list">
          {sessions.map((session) => (
            <li
              key={session.id}
              className={session.id === activeId ? "saved-item saved-item-active" : "saved-item"}
            >
              <div className="saved-info">
                <strong>{session.data.title}</strong>
                <span className="saved-meta">
                  {MODE_LABEL[session.data.mode]} · {formatDate(session.data.generatedAt)}
                </span>
                <span className="saved-meta">{progressSummary(session)}</span>
              </div>

              <div className="saved-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onOpen(session.id)}
                  disabled={disabled}
                >
                  <FolderOpen size={16} />
                  Open
                </button>
                <button
                  type="button"
                  className="secondary-button danger"
                  onClick={() => handleDelete(session)}
                  aria-label={`Delete ${session.data.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

    </section>
  );
}

export default SavedSessions;