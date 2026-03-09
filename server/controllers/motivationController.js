import { motivationalMessages } from "../data/motivationalMessages.js";

// @desc    Get random motivational message
// @route   GET /api/motivation
export function getRandomMotivation(req, res) {
  try {
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    const message = motivationalMessages[randomIndex];

    res.json({ motif: message });
  } catch (err) {
    console.error("Motivation error:", err);
    res.status(500).json({ error: "Failed to get motivation message" });
  }
}
