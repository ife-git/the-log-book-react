import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";
console.log("🔐 Login component - using API_URL:", API_URL);

function Login({ setUser }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        navigate("/notes");
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* App Header */}
      <header className="auth-header">
        <Link to="/" className="auth-header-title">
          <h1>The Log Book</h1>
        </Link>
        <p className="auth-header-sub">
          Document your journey, one note at a time
        </p>
      </header>

      <main className="sign-forms">
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-inner">
            <h2>Welcome Back</h2>
            <p>Please log in to continue</p>

            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <button type="submit" disabled={loading} className="sign-up">
              {loading ? "Logging in..." : "Log In"}
            </button>

            <p className="auth-redirect">
              Don't have an account?{" "}
              <Link to="/signup" className="login-text">
                Sign up here
              </Link>
            </p>

            {error && <p className="error">{error}</p>}
          </div>
        </form>
      </main>
    </div>
  );
}

export default Login;
