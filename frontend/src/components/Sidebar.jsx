import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Trophy,
  Settings,
  Brain
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo">
        <Brain size={28} />
        <span>AlgoPrep AI</span>
      </div>

      <p className="menu-label">MENU</p>

      <nav className="sidebar-nav">

        <a href="#" className="nav-item active">
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </a>

        <a href="#" className="nav-item">
          <BookOpen size={19} />
          <span>Study Materials</span>
        </a>

        <a href="#" className="nav-item">
          <Layers size={19} />
          <span>Flashcards</span>
        </a>

        <a href="#" className="nav-item">
          <Trophy size={19} />
          <span>My Progress</span>
        </a>

      </nav>

      <div className="sidebar-bottom">
        <a href="#" className="nav-item">
          <Settings size={19} />
          <span>Settings</span>
        </a>

        <div className="profile">
          <div className="avatar">A</div>
          <div>
            <strong>Student</strong>
            <small>Free Account</small>
          </div>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;