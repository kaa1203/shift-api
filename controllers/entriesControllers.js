import asyncHandler from "express-async-handler";
import parseQueryParams from "../utils/parseQueryParams.js";
import { entryValidation } from "../utils/validator.js";
import { hasError, isIdValid, checkParam } from "../utils/check.js";
import { Entry } from "../models/entriesModel.js";
import getDateFormat from "../utils/getDate.js";
import { decrypt, encrypt } from "../utils/encryptUtil.js";

const getEntries = asyncHandler(async (req, res) => {
  const { limit, q, skip, filters } = parseQueryParams(req.query);

  let query = { userId: req.user._id };

  if (q) {
    query.$or = [{ tags: { $regex: q, $options: "i" } }];
  }

  if (filters) {
    const { startDate, endDate, label, tags } = filters;

    if (startDate || endDate) {
      query.postedAt = {};
      if (startDate) query.postedAt.$gte = new Date(startDate);
      if (endDate) query.postedAt.$lte = new Date(endDate);

      delete filters.startDate;
      delete filters.endDate;
    }

    if (label) {
      query["mood.label"] = label;
      delete filters.label;
    }

    if (tags) {
      query.tags = tags;
      delete filters.tags;
    }

    query = { ...query, ...filters };
  }

  console.log(query);

  const entries = await Entry.find(query).limit(limit).skip(skip);

  entries.map((en) => {
    if (en.entry) en.entry = decrypt(en.entry);
  });

  res.status(200).json(entries);
});

const getEntryById = asyncHandler(async (req, res) => {
  const entryId = req.params.entryId;

  isIdValid(entryId);

  const entry = await Entry.find({ _id: entryId, userId: req.user._id });

  res.status(200).json({ entry });
});

const getMoodStats = asyncHandler(async (_, res) => {
  const {
    todayStart,
    todayEnd,
    weekStart,
    weekEnd,
    monthStart,
    monthEnd,
    yearStart,
    yearEnd,
  } = getDateFormat();

  const generatePipeline = (startDate, endDate) => [
    { $match: { postedAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: "$mood.label",
        totalIntensity: { $sum: "$mood.intensity" },
        totalEntry: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        perLabel: {
          $push: {
            label: "$_id",
            totalIntensity: "$totalIntensity",
            totalEntry: "$totalEntry",
          },
        },
        totalIntensity: { $sum: "$totalIntensity" },
        totalEntry: { $sum: "$totalEntry" },
      },
    },
    {
      $project: {
        _id: 0,
        perLabel: 1,
        totalEntry: 1,
        moodPercentage: {
          $multiply: [
            {
              $divide: ["$totalIntensity", { $multiply: ["$totalEntry", 5] }],
            },
            100,
          ],
        },
      },
    },
  ];

  const result = await Entry.aggregate([
    {
      $facet: {
        daily: generatePipeline(todayStart, todayEnd),
        weekly: generatePipeline(weekStart, weekEnd),
        monthly: generatePipeline(monthStart, monthEnd),
        yearly: generatePipeline(yearStart, yearEnd),
      },
    },
  ]);

  res.status(200).json(result);
});

const addEntry = asyncHandler(async (req, res) => {
  const { value, error } = entryValidation(req.body, { isUpdate: false });

  hasError(error);

  value.userId = req.user._id;
  value.postedAt = Date.now();

  value.entry = encrypt(value.entry);

  await Entry.create(value);

  res.status(200).json({ message: "Entry created!" });
});

const updateEntry = asyncHandler(async (req, res) => {
  const { value, error } = entryValidation(req.body, { isUpdate: true });

  hasError(error);

  const entryId = req.params.entryId;

  isIdValid(entryId);

  const [entry] = await Entry.find({ userId: req.user._id, _id: entryId });

  checkParam(entry, "entry");

  for (const [key, val] of Object.entries(value)) {
    if (val !== undefined) entry[key] = val;
    if (key === "entry") entry[key] = encrypt(val);
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
  getMoodStats,
  addEntry,
  updateEntry,
  softDeleteEntry,
  restoreEntry,
  deleteEntry,
};
