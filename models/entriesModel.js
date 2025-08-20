import mongoose from "mongoose";

const entriesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  postedAt: { type: Date, default: Date.now },
  mood: {
    label: {
      type: String,
      required: true,
      enum: ["very sad", "sad", "fine", "happy", "very happy"],
      trim: true,
    },
    intensity: { type: Number, min: 1, max: 5, required: true, trim: true },
  },
  entry: { type: String, maxlength: 5000, trim: true },
  tags: [{ type: String }],
  isDeleted: { type: String, default: false },
  deletedAt: { type: Date, default: null },
});

entriesSchema.index({ tags: 1 });

export const Entry = mongoose.model("Entry", entriesSchema);
