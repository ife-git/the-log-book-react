import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";

function Landing({ user, setUser }) {
  const [motivation, setMotivation] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch motivational message
  useEffect(() => {
    fetchMotivation();
    // Set up polling every 3 seconds
    const interval = setInterval(fetchMotivation, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchMotivation = async () => {
    try {
      const response = await fetch(`${API_URL}/motivation`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setMotivation(data.motif);
    } catch (err) {
      console.log("Failed to fetch motivation:", err);
      setMotivation("✨ Stay curious, keep logging! ✨");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      {/* Top Banner with Welcome and Logout */}
      <div className="top-banner">
        <p className="top-banner-greeting">
          Welcome, {user?.name || "Guest"}! 👋
        </p>
        <button
          className="logout-btn"
          onClick={handleLogout}
          aria-label="Log out"
        >
          Log out
        </button>
      </div>

      {/* Site Header / Navigation */}
      <header className="site-header">
        <nav id="main-navigation">
          <ul>
            <li>
              <Link to="/landing">Home</Link>
            </li>
            <li>
              <Link to="/notes">Read Notes</Link>
            </li>
            <li>
              <Link to="/upload">Upload Notes</Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Page Content */}
      <main>
        <h1 className="welcome-message">Welcome to the Log Book...📖🫡</h1>

        <section className="motivation">
          <div className="live-container" id="live-container">
            {loading ? "Loading..." : motivation}
          </div>
        </section>
      </main>
    </>
  );
}

export default Landing;
