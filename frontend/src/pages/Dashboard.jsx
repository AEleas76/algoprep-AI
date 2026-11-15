import { useState } from "react";
import { Clock, Target, BookOpen } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TopicInput from "../components/TopicInput";

function Dashboard() {
  const [studyRequest, setStudyRequest] = useState(null);

  const handleGenerate = (topic, mode) => {
    setStudyRequest({ topic, mode });
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

          <TopicInput onGenerate={handleGenerate} />

          {studyRequest && (
            <div className="request-preview">
              <h3>Study request received!</h3>
              <p>Topic: {studyRequest.topic}</p>
              <p>Mode: {studyRequest.mode}</p>
              <small>
                AI integration will be connected in a later step.
              </small>
            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;