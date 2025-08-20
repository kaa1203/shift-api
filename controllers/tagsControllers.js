import asyncHandler from "express-async-handler";

const getTags = asyncHandler(async (req, res) => {
  res.json("get tag");
});
const addTags = asyncHandler(async (req, res) => {
  res.json("add tag");
});
const updateTags = asyncHandler(async (req, res) => {
  res.json("update tag");
});
const deleteTags = asyncHandler(async (req, res) => {
  res.json("delete tag");
});

export { getTags, addTags, updateTags, deleteTags };
