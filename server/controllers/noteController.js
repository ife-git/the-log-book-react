import Note from "../models/Note.js";
import User from "../models/User.js";
import { appEvents } from "../events/eventEmitter.js";
import { sanitizeInput } from "../utils/sanitizeInput.js";

// @desc    Get all notes for logged-in user
// @route   GET /api/notes
export async function getAllNotes(req, res) {
  try {
    const notes = await Note.find({ userId: req.session.userId }).sort({
      createdAt: -1,
    });

    res.json(notes);
  } catch (err) {
    console.error("GET notes error:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
}

// @desc    Get single note
// @route   GET /api/notes/:id
export async function getNote(req, res) {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    console.error("GET note error:", err);
    res.status(500).json({ error: "Failed to fetch note" });
  }
}

// @desc    Create new note
// @route   POST /api/notes
export async function createNote(req, res) {
  try {
    const { title, content, category, timestamp } = req.body;

    // Validate required fields
    const requiredFields = { title, content, category, timestamp };
    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key],
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Sanitize input BEFORE creating note
    const cleanData = sanitizeInput({ title, content, category, timestamp });

    // Create note with user ID
    const note = await Note.create({
      ...cleanData,
      userId: req.session.userId,
    });

    // Get user info for email
    const user = await User.findById(req.session.userId);

    // Emit event for email notification
    appEvents.emit("note:created", note, user);

    res.status(201).json(note);
  } catch (err) {
    console.error("CREATE note error:", err);
    res.status(500).json({ error: "Failed to create note" });
  }
}

// @desc    Update note
// @route   PUT /api/notes/:id
export async function updateNote(req, res) {
  try {
    const { title, content, category, timestamp } = req.body;

    // Find note and ensure it belongs to user
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Update fields
    note.title = title || note.title;
    note.content = content || note.content;
    note.category = category || note.category;
    note.timestamp = timestamp || note.timestamp;

    await note.save();

    res.json(note);
  } catch (err) {
    console.error("UPDATE note error:", err);
    res.status(500).json({ error: "Failed to update note" });
  }
}

// @desc    Delete note
// @route   DELETE /api/notes/:id
export async function deleteNote(req, res) {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Get user for email
    const user = await User.findById(req.session.userId);

    // Emit deletion event
    appEvents.emit("note:deleted", note.title, user);

    res.status(204).send();
  } catch (err) {
    console.error("DELETE note error:", err);
    res.status(500).json({ error: "Failed to delete note" });
  }
}
