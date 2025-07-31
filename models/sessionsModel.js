import mongoose from "mongoose";

const SessionSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    refreshToken: String,
    expiresAt: Date,
    deviceId: String,
    deviceInfo: String,
    ip: String,
  },
  { timestamps: true }
);

export const Session = mongoose.model("Session", SessionSchema);
