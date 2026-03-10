import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";

function Notes({ user, setUser }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
  const navigate = useNavigate();

  // Load notes on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/notes`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to load notes");
      }

      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReadMore = (noteId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
  };

  const handleEdit = (noteId) => {
    navigate(`/upload/${noteId}`);
  };

  const handleDelete = async (noteId) => {
    // Add this one line if you want confirmation
    // if (!window.confirm("Delete this note?")) return;
    try {
      const res = await fetch(`${API_URL}/notes/${noteId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Delete failed");

      // Remove note from state
      setNotes(notes.filter((note) => note._id !== noteId));
    } catch (err) {
      console.error("Delete error:", err);
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

  if (loading) {
    return (
      <>
        <div className="top-banner">
          <p className="top-banner-greeting">Welcome, {user?.name}!</p>
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
        <main>
          <h1>Your Notes</h1>
          <p>Loading your notes...</p>
        </main>
      </>
    );
  }

  return (
    <>
      {/* Top Banner with Welcome and Logout */}
      <div className="top-banner">
        <p className="top-banner-greeting">Welcome, {user?.name}! 👋</p>
        <button className="logout-btn" onClick={handleLogout}>
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
          <Link to="/landing" className="site-title-page">
            The Log Book
          </Link>
        </nav>
      </header>

      {/* Notes Content */}
      <main>
        <h1>Your Notes</h1>
        <p>All your logged ideas, lessons, and thoughts in one place.</p>

        {notes.length === 0 ? (
          <p className="no-notes">
            No notes yet. <Link to="/upload">Create your first note!</Link>
          </p>
        ) : (
          <section className="cards-container">
            {notes.map((note) => (
              <article
                key={note._id}
                className={`note-card ${expandedCards[note._id] ? "expanded" : ""}`}
              >
                <p className="card-details">{note.timestamp}</p>
                <h3>{note.title}</h3>
                <div className="note-text-wrapper">
                  <p className="note-text">{note.content}</p>
                </div>
                <div className="note-actions">
                  <button
                    className="read-more-btn"
                    onClick={() => handleReadMore(note._id)}
                  >
                    {expandedCards[note._id] ? "Show less" : "Read in full"}
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(note._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(note._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}

export default Notes;
