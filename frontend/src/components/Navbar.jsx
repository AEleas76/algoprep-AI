import { Bell, Menu, Search } from "lucide-react";
import "./Navigation.css";

function Navbar({ onMenuClick }) {
  return (
    <header className="navbar">

      <div className="navbar-left">
        <button
          type="button"
          className="icon-button menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search topics, flashcards..."
            aria-label="Search topics and flashcards"
          />
        </div>
      </div>

      <div className="navbar-right">
        <button
          type="button"
          className="icon-button"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>

        <span className="welcome-text">
          Welcome back!
        </span>
      </div>

    </header>
  );
}

export default Navbar;