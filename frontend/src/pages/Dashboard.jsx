import { useMemo, useState } from "react";
import { Target, BookOpen, Layers } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TopicInput from "../components/TopicInput";
import GenerationStatus from "../components/GenerationStatus";
import SavedSessions from "../components/SavedSessions";
import StudySession from "./StudySession";
import { useStudyGenerator } from "../hooks/useStudyGenerator";
import { useSavedSessions } from "../hooks/useSavedSessions";
import { computeStats } from "../utils/stats";

function Dashboard() {
  const { status, error, generate, retry, cancel } = useStudyGenerator();
  const { sessions, addSession, saveRatings, recordQuizRound, removeSession } =
    useSavedSessions();
  const [activeId, setActiveId] = useState(null);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;
  const stats = useMemo(() => computeStats(sessions), [sessions]);
  const isLoading = status === "loading";

  // A successful generation is saved immediately and opened.
  const openNewSession = (data) => {
    if (data) setActiveId(addSession(data));
  };

  const handleGenerate = async (topic, mode, difficulty) => {
    openNewSession(await generate({ topic, mode, difficulty }));
  };

  const handleRetry = async () => {
    openNewSession(await retry());
  };

  const handleOpen = (id) => {
    cancel(); // clears any old error card
    setActiveId(id);
  };

  const handleDelete = (id) => {
    removeSession(id);
    if (id === activeId) setActiveId(null);
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
              <h3>{stats.topics}</h3>
              <p>Topics studied</p>
            </div>

            <div className="stat-card">
              <Target size={23} />
              <h3>{stats.accuracy === null ? "-" : `${stats.accuracy}%`}</h3>
              <p>Quiz accuracy</p>
            </div>

            <div className="stat-card">
              <Layers size={23} />
              <h3>{stats.easyCards}</h3>
              <p>Cards rated easy</p>
            </div>

          </div>

          <TopicInput
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />

          <GenerationStatus
            status={status}
            error={error}
            onRetry={handleRetry}
            onCancel={cancel}
          />

          <SavedSessions
            sessions={sessions}
            activeId={activeId}
            disabled={isLoading}
            onOpen={handleOpen}
            onDelete={handleDelete}
          />

          {activeSession && (
            <StudySession
              key={activeSession.id}
              session={activeSession}
              onRatingsChange={saveRatings}
              onQuizRound={recordQuizRound}
            />
          )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;