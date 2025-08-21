import express from "express";
import {
  addTags,
  deleteTags,
  getTags,
  updateTags,
} from "../../controllers/tagsControllers.js";
import authenticate from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, getTags);
router.post("/", authenticate, addTags);
router.patch("/:tagId", authenticate, updateTags);
router.delete("/:tagId", authenticate, deleteTags);

export { router };
