import dns from "dns";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import cors from "cors";

// Force Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

// ... your imports ...

const app = express();

// Configure CORS - BEFORE any other middleware!
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Allow all Vercel app subdomains and your custom domain if you have one
    const allowedDomains = [
      ".vercel.app",
      "localhost",
      "127.0.0.1",
      // Add your custom domain here later if you have one, e.g., 'yourdomain.com'
    ];

    // Check if the origin ends with any of the allowed domains
    const isAllowed = allowedDomains.some(
      (domain) => origin.endsWith(domain) || origin.includes(`://${domain}`),
    );

    if (isAllowed) {
      // Reflect the origin sent in the request
      callback(null, origin);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions)); // ← Move this up here!

const PORT = process.env.PORT || 8000;

// Connect to MongoDB
try {
  await connectDB();
  console.log("✅ MongoDB connected");
} catch (error) {
  console.error("❌ MongoDB connection failed:", error);
  process.exit(1);
}

// THEN other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 14,
    },
  }),
);

// ... rest of your routes

// Import routes
import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/notes.js";
import motivationRoutes from "./routes/motivation.js";

// ========== ROUTE ORDER IS CRITICAL ==========

// ✅ 1. TEST ROUTE - Simple test
app.get("/test", (req, res) => {
  res.send("Server is working!");
});

// ✅ 2. API ROUTES - These must come BEFORE static/catch-all
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/motivation", motivationRoutes);

// ✅ 3. STATIC FILES - Serve HTML, CSS, JS, images
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
} else {
  app.use(express.static(path.join(__dirname, "public")));
}

// ✅ 4. CATCH-ALL - This MUST be LAST!
// This serves index.html for any unmatched routes (React routing)
app.use((req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith("/api/")) {
    res.sendFile(path.join(__dirname, "public/index.html"));
  } else {
    res.status(404).json({ error: "API endpoint not found" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
