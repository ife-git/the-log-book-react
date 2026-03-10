import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

function Upload({ user, setUser }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "learning",
    timestamp: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams(); // Get note ID from URL if editing
  const API_URL = import.meta.env.VITE_API_URL;

  // Check if we're editing an existing note
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadNoteForEdit(id);
    }
  }, [id]);

  const loadNoteForEdit = async (noteId) => {
    try {
      const res = await fetch(`${API_URL}/notes/${noteId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to load note");
      }

      const note = await res.json();

      // Convert timestamp back to datetime-local format
      const dateForInput = note.timestamp
        ? parseTimestampToDateTimeLocal(note.timestamp)
        : "";

      setFormData({
        title: note.title || "",
        content: note.content || "",
        category: note.category || "learning",
        timestamp: dateForInput,
      });
    } catch (err) {
      console.error("Failed to load note for edit:", err);
      showMessage("Failed to load note", "error");
    }
  };

  // Helper function to parse timestamp for datetime-local input
  const parseTimestampToDateTimeLocal = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toISOString().slice(0, 16);
      }

      // Handle "7 January 2025 at 09:30" format
      const match = timestamp.match(/(\d+) (\w+) (\d+) at (\d+):(\d+)/);
      if (match) {
        const [_, day, month, year, hour, minute] = match;
        const monthMap = {
          January: 0,
          February: 1,
          March: 2,
          April: 3,
          May: 4,
          June: 5,
          July: 6,
          August: 7,
          September: 8,
          October: 9,
          November: 10,
          December: 11,
        };
        const date = new Date(year, monthMap[month], day, hour, minute);
        return date.toISOString().slice(0, 16);
      }
      return "";
    } catch (e) {
      console.error("Error parsing timestamp:", e);
      return "";
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, content, category, timestamp } = formData;

    if (!title || !content || !category || !timestamp) {
      showMessage("Please complete all fields.", "error");
      return;
    }

    // Create both timestamp formats
    const dateObj = new Date(timestamp);
    const readableDate = dateObj
      .toLocaleString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", " at");

    const data = {
      title,
      content,
      category,
      timestamp: readableDate,
    };

    const url = isEditing ? `${API_URL}/notes/${id}` : `${API_URL}/notes`;
    const method = isEditing ? "PUT" : "POST";

    try {
      setLoading(true);
      showMessage(isEditing ? "Updating note..." : "Uploading note...", "info");

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server responded with ${response.status}`,
        );
      }

      showMessage(
        isEditing
          ? "✅ Note updated successfully!"
          : "✅ Note uploaded successfully!",
        "success",
      );

      // Reset form if creating new note
      if (!isEditing) {
        setFormData({
          title: "",
          content: "",
          category: "learning",
          timestamp: "",
        });
      }

      // Redirect to notes page after 1.5 seconds
      setTimeout(() => {
        navigate("/notes");
      }, 1500);
    } catch (error) {
      console.error("Upload error:", error);
      showMessage(`⚠️ Upload failed: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    // Clear message after 5 seconds
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
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

      {/* Upload Form */}
      <main>
        <header className="page-header">
          <h1>{isEditing ? "Edit Note" : "New Log Entry"}</h1>
          <p>
            {isEditing
              ? "Update your thoughts"
              : "Log thoughts, bugs, lessons, or ideas."}
          </p>
        </header>

        <form onSubmit={handleSubmit} id="log-form">
          {/* Title */}
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Write a short title"
            required
            disabled={loading}
          />

          {/* Content */}
          <label htmlFor="content">Details</label>
          <textarea
            id="content"
            name="content"
            rows="5"
            value={formData.content}
            onChange={handleChange}
            placeholder="Today I learned..."
            required
            disabled={loading}
          />

          {/* Category */}
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="learning">Learning</option>
            <option value="debugging">Debugging</option>
            <option value="ideas">Ideas</option>
            <option value="reflection">Reflection</option>
          </select>

          {/* Timestamp */}
          <label htmlFor="timestamp">Date & Time</label>
          <input
            type="datetime-local"
            id="timestamp"
            name="timestamp"
            value={formData.timestamp}
            onChange={handleChange}
            required
            disabled={loading}
          />

          {/* Submit Button */}
          <button type="submit" disabled={loading}>
            {loading
              ? isEditing
                ? "Updating..."
                : "Uploading..."
              : isEditing
                ? "Update Entry"
                : "Add Entry"}
          </button>

          {/* Message Display */}
          {message.text && (
            <p className={`form-message ${message.type}`}>{message.text}</p>
          )}

          <p className="form-message">
            All logged notes can be viewed on the <Link to="/notes">Notes</Link>{" "}
            page.
          </p>
        </form>
      </main>
    </>
  );
}

export default Upload;
