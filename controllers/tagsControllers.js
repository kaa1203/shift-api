import asyncHandler from "express-async-handler";
import parseQueryParams from "../utils/parseQueryParams.js";
import { Tag } from "../models/tagsModel.js";
import { tagValidation } from "../utils/validator.js";
import { checkParam, hasError, isIdValid } from "../utils/check.js";
import { CustomError } from "../middlewares/errorMiddleware.js";

const getTags = asyncHandler(async (req, res) => {
  const { q, limit, skip } = parseQueryParams(req.params);

  let query = { userId: req.user._id };

  if (q) query = { ...query, q };

  const tags = await Tag.find(query).limit(limit).skip(skip);

  res.status(200).json(tags);
});

const addTags = asyncHandler(async (req, res, next) => {
  const { value, error } = tagValidation(req.body);

  hasError(error);

  const tag = await Tag.findOne({ name: value.name });

  if (tag) return next(new CustomError("Tag already existed!", 409));

  value.userId = req.user._id;

  const newTag = await Tag.create(value);

  res.status(200).json(newTag);
});

const updateTags = asyncHandler(async (req, res) => {
  const { value, error } = tagValidation(req.body);

  hasError(error);

  const tagId = req.params.tagId;

  isIdValid(tagId);

  const tag = await Tag.findById(tagId);

  checkParam(tag, "tag");

  Object.entries(value).map(([key, val]) => {
    if (val !== undefined) tag[key] = val;
  });

  await tag.save();

  res.status(200).json(tag);
});

const deleteTags = asyncHandler(async (req, res) => {
  const tagId = req.params.tagId;

  isIdValid(tagId);

  const tag = await Tag.findById(tagId);

  checkParam(tag, "tag");

  await Tag.deleteOne({ _id: tagId });

  res.status(200).json({ message: "Tag deleted!" });
});

export { getTags, addTags, updateTags, deleteTags };
