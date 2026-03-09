import express from "express";
import { getRandomMotivation } from "../controllers/motivationController.js";
const router = express.Router();

router.get("/", getRandomMotivation);

export default router;
