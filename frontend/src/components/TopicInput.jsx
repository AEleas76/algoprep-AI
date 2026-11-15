import { useState } from "react";
import { Sparkles, BookOpen, Layers } from "lucide-react";

const MIN_LENGTH = 3;
const MAX_LENGTH = 4000;

function TopicInput({ onGenerate, isLoading = false }) {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("both");
  const [difficulty, setDifficulty] = useState("mixed");

  const canSubmit = topic.trim().length >= MIN_LENGTH && !isLoading;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!canSubmit) return;

    onGenerate(topic.trim(), mode, difficulty);
  };

  return (
    <form className="topic-card" onSubmit={handleSubmit}>

      <div className="section-heading">
        <div>
          <h2>What do you want to learn?</h2>
          <p>Enter a topic or paste your study notes.</p>
        </div>
        <Sparkles size={24} className="sparkle-icon" />
      </div>

      <textarea
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Example: Explain Binary Search Trees, including insertion, deletion and searching..."
        rows={5}
        maxLength={MAX_LENGTH}
        disabled={isLoading}
      />

      <div className="topic-options">

        <div className="mode-selector">

          <button
            type="button"
            className={mode === "flashcards" ? "mode active-mode" : "mode"}
            onClick={() => setMode("flashcards")}
            disabled={isLoading}
          >
            <Layers size={18} />
            Flashcards
          </button>

          <button
            type="button"
            className={mode === "quiz" ? "mode active-mode" : "mode"}
            onClick={() => setMode("quiz")}
            disabled={isLoading}
          >
            <BookOpen size={18} />
            Quiz
          </button>

          <button
            type="button"
            className={mode === "both" ? "mode active-mode" : "mode"}
            onClick={() => setMode("both")}
            disabled={isLoading}
          >
            <Sparkles size={18} />
            Both
          </button>

        </div>

        <label className="difficulty-select">
          Difficulty
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={isLoading}
          >
            <option value="mixed">Mixed</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

      </div>

      <button
        type="submit"
        className="generate-button"
        disabled={!canSubmit}
      >
        <Sparkles size={18} />
        {isLoading ? "Generating..." : "Generate Study Material"}
      </button>

    </form>
  );
}

export default TopicInput;