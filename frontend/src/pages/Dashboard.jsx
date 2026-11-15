import { Clock, Target, BookOpen } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TopicInput from "../components/TopicInput";
import GenerationStatus from "../components/GenerationStatus";
import { useStudyGenerator } from "../hooks/useStudyGenerator";

function Dashboard() {
  const { status, data, error, generate, retry, cancel } = useStudyGenerator();

  const handleGenerate = (topic, mode, difficulty) => {
    generate({ topic, mode, difficulty });
  };

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="main-content">

        <Navbar />

        <div className="dashboard-content">

          <div className="welcome-section">
            <div>
              <h1>Learn smarter with AI.</h1>
              <p>
                Turn your study materials into interactive
                learning experiences.
              </p>
            </div>
          </div>

          <div className="stats-grid">

            <div className="stat-card">
              <BookOpen size={23} />
              <h3>0</h3>
              <p>Topics studied</p>
            </div>

            <div className="stat-card">
              <Target size={23} />
              <h3>0%</h3>
              <p>Quiz accuracy</p>
            </div>

            <div className="stat-card">
              <Clock size={23} />
              <h3>0 hrs</h3>
              <p>Study time</p>
            </div>

          </div>

          <TopicInput
            onGenerate={handleGenerate}
            isLoading={status === "loading"}
          />

          <GenerationStatus
            status={status}
            error={error}
            onRetry={retry}
            onCancel={cancel}
          />

          {/* TEMPORARY preview: replaced by StudySession in the next steps */}
          {status === "success" && data && (
            <div className="request-preview">
              <h3>{data.title}</h3>
              <p>
                {data.flashcards.length} flashcards, {data.quiz.length} quiz questions
              </p>
              <ul className="preview-list">
                {data.flashcards.map((card) => (
                  <li key={card.id}>{card.question}</li>
                ))}
                {data.quiz.map((q) => (
                  <li key={q.id}>{q.question}</li>
                ))}
              </ul>
              <small>
                Interactive flashcards and quiz are coming in the next step.
              </small>
            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;