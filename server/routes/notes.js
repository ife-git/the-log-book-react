import express from "express";
import {
  getAllNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// All note routes require authentication
router.use(requireAuth);

router.get("/", getAllNotes);
router.get("/:id", getNote);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
