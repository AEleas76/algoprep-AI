import { useCallback, useMemo, useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;
  const stats = useMemo(() => computeStats(sessions), [sessions]);
  const isLoading = status === "loading";

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

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

      <Sidebar isOpen={menuOpen} onClose={closeMenu} />

      <main className="main-content">

        <Navbar onMenuClick={openMenu} />

        <div className="dashboard-content" id="top">

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

          <div id="generate">
            <TopicInput
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </div>

          <GenerationStatus
            status={status}
            error={error}
            onRetry={handleRetry}
            onCancel={cancel}
          />

          <div id="saved">
            <SavedSessions
              sessions={sessions}
              activeId={activeId}
              disabled={isLoading}
              onOpen={handleOpen}
              onDelete={handleDelete}
            />
          </div>

          {activeSession && (
            <div id="study">
              <StudySession
                key={activeSession.id}
                session={activeSession}
                onRatingsChange={saveRatings}
                onQuizRound={recordQuizRound}
              />
            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;