import express from "express";
import {
  addEntry,
  deleteEntry,
  getEntries,
  getEntryById,
  getEntryStats,
  getMoodStats,
  softDeleteEntry,
  updateEntry,
} from "../../controllers/entriesControllers.js";

const router = express.Router();

router.get("/moodStats", getMoodStats);
router.get("/entryStats", getEntryStats);

router.get("/", getEntries).get("/:id", getEntryById);

router.post("/", addEntry);

router.patch("/:id", updateEntry).patch("/:id/softDelete", softDeleteEntry);

router.delete("/:id", deleteEntry);

export { router };
