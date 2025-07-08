import asyncHandler from "express-async-handler";

const getEntries = asyncHandler(async (req, res) => {
  return res.status(200).json({ message: "heheh" });
});

const getEntryById = asyncHandler(async (req, res) => {});

const getEntryStats = asyncHandler(async (req, res) => {});

const getMoodStats = asyncHandler(async (req, res) => {});

const addEntry = asyncHandler(async (req, res) => {});

const updateEntry = asyncHandler(async (req, res) => {});

const softDeleteEntry = asyncHandler(async (req, res) => {});

const deleteEntry = asyncHandler(async (req, res) => {});

export {
  getEntries,
  getEntryById,
  getEntryStats,
  getMoodStats,
  addEntry,
  updateEntry,
  softDeleteEntry,
  deleteEntry,
};
