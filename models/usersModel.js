import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    accountType: {
      type: String,
      enum: ["super admin", "admin", "user"],
      required: true,
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      required: true,
      default: "active",
    },
    avatar: { type: String, default: "thisisaurlorsomething" },
    isVerified: { type: Boolean, default: false },
    lastOnline: { type: Date, default: Date.now },
    actionToken: { type: String, default: undefined },
    tokenExpiresAt: { type: Date, default: undefined },
    suspension: { reason: String, suspendedAt: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, enum: ["user", "admin"], default: null },
  },
  { timestamps: true }
);

UserSchema.index({ fullname: 1 });
UserSchema.index({ accountType: 1 });
UserSchema.index({ status: 1 });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", UserSchema);
