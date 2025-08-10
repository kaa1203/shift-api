import asyncHandler from "express-async-handler";
import parseQueryParams from "../utils/parseQueryParams.js";
import { entryValidation } from "../utils/validator.js";
import { hasError, isIdValid, checkParam } from "../utils/check.js";
import { Entry } from "../models/entriesModel.js";

const getEntries = asyncHandler(async (req, res) => {
  const { limit, q, skip, filters } = parseQueryParams(req.query);

  let query = {};

  if (q) {
    query.$or = [{ tags: { $regex: q, $options: "i" } }];
  }

  if (filters) {
    const { startDate, endDate } = filters;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    query = { ...filters };
  }

  const entries = await Entry.find(query).limit(limit).skip(skip);

  res.status(200).json(entries);
});

const getEntryById = asyncHandler(async (req, res) => {
  const entryId = req.params.entryId;

  isIdValid(entryId);

  const entry = await Entry.find({ _id: entryId, userId: req.user._id });

  res.status(200).json({ entry });
});

const getEntryStats = asyncHandler(async (req, res) => {});

const getMoodStats = asyncHandler(async (req, res) => {});

const addEntry = asyncHandler(async (req, res) => {
  const { value, error } = entryValidation(req.body, { isUpdate: false });

  hasError(error);

  value.userId = req.user._id;
  value.postedAt = Date.now();

  await Entry.create(value);

  res.status(200).json({ message: "Entry created!" });
});

const updateEntry = asyncHandler(async (req, res) => {
  const { value, error } = entryValidation(req.body, { isUpdate: true });

  hasError(error);

  const entryId = req.params.entryId;

  isIdValid(entryId);

  const [entry] = await Entry.find({ userId: req.user._id, _id: entryId });

  checkParam(entry);

  for (const [key, val] of Object.entries(value)) {
    if (val !== undefined) entry[key] = val;
  }

  await entry.save();

  res.status(200).json({ message: "Entry updated!" });
});

const softDeleteEntry = asyncHandler(async (req, res) => {
  const entryId = req.params.entryId;

  isIdValid(entryId);

  const entry = await Entry.findOne({
    _id: entryId,
    userId: req.user._id,
    isDeleted: false,
  });

  checkParam(entry, "entry");

  entry.isDeleted = true;
  entry.deletedAt = Date.now();

  await entry.save();

  res.status(200).json({ message: "Entry deleted!" });
});

const restoreEntry = asyncHandler(async (req, res) => {
  const entryId = req.params.entryId;

  isIdValid(entryId);

  const entry = await Entry.findOne({
    _id: entryId,
    userId: req.user._id,
    isDeleted: true,
  });

  checkParam(entry, "entry");

  entry.isDeleted = false;
  entry.deletedAt = null;

  await entry.save();

  res.status(200).json({ message: "Entry restored!" });
});

const deleteEntry = asyncHandler(async (req, res) => {
  const entryId = req.params.entryId;

  isIdValid(entryId);

  const entry = await Entry.findById(entryId);

  checkParam(entry, "entry");

  await Entry.deleteOne({ _id: entryId });

  res.status(200).json({ message: "Entry deleted!" });
});

export {
  getEntries,
  getEntryById,
  getEntryStats,
  getMoodStats,
  addEntry,
  updateEntry,
  softDeleteEntry,
  restoreEntry,
  deleteEntry,
};
