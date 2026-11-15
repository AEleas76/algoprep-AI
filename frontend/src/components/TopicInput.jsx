import { useState } from "react";
import { Sparkles, BookOpen, Layers } from "lucide-react";

function TopicInput({ onGenerate }) {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("both");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!topic.trim()) return;

    onGenerate(topic, mode);
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
      />

      <div className="mode-selector">

        <button
          type="button"
          className={mode === "flashcards" ? "mode active-mode" : "mode"}
          onClick={() => setMode("flashcards")}
        >
          <Layers size={18} />
          Flashcards
        </button>

        <button
          type="button"
          className={mode === "quiz" ? "mode active-mode" : "mode"}
          onClick={() => setMode("quiz")}
        >
          <BookOpen size={18} />
          Quiz
        </button>

        <button
          type="button"
          className={mode === "both" ? "mode active-mode" : "mode"}
          onClick={() => setMode("both")}
        >
          <Sparkles size={18} />
          Both
        </button>

      </div>

      <button
        type="submit"
        className="generate-button"
        disabled={!topic.trim()}
      >
        <Sparkles size={18} />
        Generate Study Material
      </button>

    </form>
  );
}

export default TopicInput;