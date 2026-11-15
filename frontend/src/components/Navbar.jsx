import { Bell, Search } from "lucide-react";

function Navbar() {
  return (
    <header className="navbar">

      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search topics, flashcards..."
        />
      </div>

      <div className="navbar-right">
        <button className="icon-button">
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