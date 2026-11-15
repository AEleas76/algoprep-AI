import { useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Trophy,
  Settings,
  Brain,
  X
} from "lucide-react";
import "./Navigation.css";

// Each link scrolls to a section of the dashboard (see ids in Dashboard.jsx).
const NAV_ITEMS = [
  { href: "#top", label: "Dashboard", icon: LayoutDashboard, active: true },
  { href: "#generate", label: "Study Materials", icon: BookOpen },
  { href: "#study", label: "Flashcards", icon: Layers },
  { href: "#saved", label: "My Progress", icon: Trophy },
];

function Sidebar({ isOpen, onClose }) {
  // Close the mobile drawer with the Escape key.
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={isOpen ? "sidebar sidebar-open" : "sidebar"}>

        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <X size={22} />
        </button>

        <div className="logo">
          <Brain size={28} />
          <span>AlgoPrep AI</span>
        </div>

        <p className="menu-label">MENU</p>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon, active }) => (
            <a
              key={label}
              href={href}
              className={active ? "nav-item active" : "nav-item"}
              onClick={onClose}
            >
              <Icon size={19} />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <a href="#" className="nav-item" onClick={onClose}>
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
    </>
  );
}

export default Sidebar;