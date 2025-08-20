import express from "express";
import {
  addTags,
  deleteTags,
  getTags,
  updateTags,
} from "../../controllers/tagsControllers.js";

const router = express.Router();

router.get("/", getTags);
router.post("/add", addTags);
router.patch("/update/:tagId", updateTags);
router.delete("/delete/:tagId", deleteTags);

export { router };
