import mongoose from "mongoose";

const TagSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    color: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export const Tag = mongoose.model("Tag", TagSchema);
