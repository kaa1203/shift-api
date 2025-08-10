import express from "express";
import {
  addEntry,
  deleteEntry,
  getEntries,
  getEntryById,
  getEntryStats,
  getMoodStats,
  restoreEntry,
  softDeleteEntry,
  updateEntry,
} from "../../controllers/entriesControllers.js";
import authenticate from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/moodStats", getMoodStats);
router.get("/entryStats", getEntryStats);

router
  .get("/", authenticate, getEntries)
  .get("/:entryId", authenticate, getEntryById);

router.post("/add", authenticate, addEntry);

router
  .patch("/update/:entryId", authenticate, updateEntry)
  .patch("/soft-delete/:entryId", authenticate, softDeleteEntry)
  .patch("/restore/:entryId", authenticate, restoreEntry);

router.delete("/:entryId", authenticate, deleteEntry);

export { router };
