import Flashcard from "../components/Flashcard";
import "./StudySession.css";

function StudySession({ data }) {
  const showFlashcards = data.mode !== "quiz";
  const showQuiz = data.mode !== "flashcards";

  return (
    <div className="study-session">

      <div className="study-session-header">
        <h2>{data.title}</h2>
        <p>
          {showFlashcards && `${data.flashcards.length} flashcards`}
          {showFlashcards && showQuiz && " · "}
          {showQuiz && `${data.quiz.length} quiz questions`}
        </p>
      </div>

      {showFlashcards && <Flashcard cards={data.flashcards} />}

      {/* TEMPORARY: replaced by the interactive Quiz component in Step 4 */}
      {showQuiz && (
        <div className="status-card">
          <div>
            <strong>Quiz ready</strong>
            <p>{data.quiz.length} questions generated. The interactive quiz is added in the next step.</p>
          </div>
        </div>
      )}

    </div>
  );
}

export default StudySession;