import Flashcard from "../components/Flashcard";
import Quiz from "../components/Quiz";
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
      {showQuiz && <Quiz questions={data.quiz} />}

    </div>
  );
}

export default StudySession;