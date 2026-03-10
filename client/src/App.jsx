import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import Notes from "./pages/Notes";
import Upload from "./pages/Upload";
import "./App.css";
import { API_URL } from "../src/config";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.isLoggedIn) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/landing" /> : <Login setUser={setUser} />
          }
        />
        <Route
          path="/signup"
          element={
            user ? <Navigate to="/landing" /> : <Signup setUser={setUser} />
          }
        />

        {/* Protected routes */}
        <Route
          path="/landing"
          element={
            user ? (
              <Landing user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/notes"
          element={
            user ? (
              <Notes user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/upload"
          element={
            user ? (
              <Upload user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/upload/:id"
          element={
            user ? (
              <Upload user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
