import { Clock, Target, BookOpen } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TopicInput from "../components/TopicInput";
import GenerationStatus from "../components/GenerationStatus";
import StudySession from "./StudySession";
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

          {status === "success" && data && (
            <StudySession key={data.generatedAt} data={data} />
          )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;