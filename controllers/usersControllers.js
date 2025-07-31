import asyncHandler from "express-async-handler";
import { UAParser } from "ua-parser-js";
import mongoose from "mongoose";

import {
  emailValidation,
  newPasswordValidation,
  registerValidation,
  updateProfileValidation,
} from "../utils/validator.js";

import { CustomError } from "../middlewares/errorMiddleware.js";

import { User } from "../models/usersModel.js";

import createEmail from "../utils/createEmail.js";

import { generateCookies, generateVToken } from "../utils/tokenGenerator.js";

import { Session } from "../models/sessionsModel.js";
import parseQueryParams from "../utils/parseQueryParams.js";

const handleCreateUser = (action) =>
  asyncHandler(async (req, res, next) => {
    const { value, error } = registerValidation(req.body);
    const { email, username } = value;

    const isAdmin = action === "create user";
    const isSuper = req.user?.accountType === "super admin";

    if (error) return next(new CustomError(error.message, 400));

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return next(new CustomError("Email is already taken!", 400));
      }
      if (existingUser.username === username) {
        return next(new CustomError("Username is already taken!", 400));
      }
    }

    if (!isAdmin) {
      const { token, expiresAt } = generateVToken();

      try {
        const emailData = {
          to: value.email,
          type: "verifyAccount",
          token,
        };

        await createEmail(emailData);

        value.actionToken = token;
        value.actionTokenExpiry = expiresAt;
      } catch (e) {
        return next(new CustomError(e.message, 400));
      }
    }

    if (!(isAdmin && isSuper)) delete value.accountType;

    value.isVerified = isAdmin;

    const user = await User.create(value);

    res.status(201).json({
      fullname: user.fullname,
      email: user.email,
      username: user.username,
      accountType: user.accountType,
      avatar: user.avatar,
    });
  });

const updateUser = asyncHandler(async (req, res, next) => {
  const { value, error } = updateProfileValidation(req.body);

  if (error) return next(new CustomError(error.message, 400));

  const targetUserId = req.params.userId || req.user._id;
  const isAdmin = req.user.accountType !== "user";
  const isSuper = req.user.accountType === "super admin";
  const isSelf = targetUserId.toString() === req.user._id.toString();

  if (!isAdmin && !isSelf)
    return next(
      new CustomError(
        "Unauthorized action, only admin can update other user's profile",
        403
      )
    );

  if (!isSuper) delete value.accountType;

  const user = await User.findById(targetUserId);

  if (!user) return next(new CustomError("User not found!", 404));

  for (const [key, val] of Object.entries(value)) {
    if (key === "username" && val !== user.username) {
      const usernameTaken = await User.findOne({ username: val });

      if (usernameTaken)
        return next(new CustomError("Username is already taken!", 400));
    }

    if (key === "email" && val !== user.email) {
      const emailTaken = await User.findOne({ email: val });

      if (emailTaken)
        return next(new CustomError("Email is already taken!", 400));
    }

    if (val !== undefined) user[key] = val;
  }

  await user.save();

  res.status(200).json(user);
});

const changePasswordRequest = asyncHandler(async (req, res, next) => {
  const { value, error } = emailValidation(req.body);

  if (error) return next(new CustomError(error.message, 400));

  const user = await User.findOne({ email: value.email });

  if (!user) return next(new CustomError("User not found!", 404));

  const { token, expiresAt } = generateVToken();

  try {
    const emailData = { to: value.email, type: "changePassword", token };

    await createEmail(emailData);

    user.actionToken = token;
    user.tokenExpiresAt = expiresAt;
    await user.save();

    return res
      .status(200)
      .json({ message: "Email sent, please check your email!" });
  } catch (e) {
    return next(new CustomError(e.message, 400));
  }
});

const changePassword = asyncHandler(async (req, res, next) => {
  const token = req.params.token;
  const _id = req.user?._id;

  const { value, error } = newPasswordValidation(req.body);

  if (error) return next(new CustomError(error.message, 400));

  let user;

  if (token) {
    user = await User.findOne({ actionToken: token });

    if (!user) return next(new CustomError("Token is not valid!", 400));

    if (user.tokenExpiresAt < new Date())
      return next(new CustomError("Token is expired, please try again!", 401));
  } else {
    if (!_id) return next(new CustomError("Unauthorized access!", 401));

    user = await User.findById(_id);

    if (!user) return next(new CustomError("User not found!", 404));
  }

  user.password = value.password;
  user.actionToken = null;
  user.tokenExpiresAt = null;

  await user.save();

  return res.status(200).json({ message: "Password changed!" });
});

const verifyAccount = asyncHandler(async (req, res, next) => {
  const token = req.params.token;

  if (!token) return next(new CustomError("Missing token!", 400));

  const user = await User.findOne({ actionToken: token });

  if (!user) return next(new CustomError("Token is not valid!", 400));

  if (user.tokenExpiresAt < new Date())
    return next(new CustomError("Token is expired, please try again!", 401));

  user.status = "active";
  user.isVerified = true;
  user.actionToken = undefined;
  user.tokenExpiresAt = undefined;

  await user.save();

  res
    .status(200)
    .send({ message: "Congratulations your are now a verified user!" });
});

const verifyAccountRequest = asyncHandler(async (req, res, next) => {
  const { value, error } = emailValidation(req.body);

  if (error) return next(new CustomError(error.message, 400));

  const user = await User.findOne({ email: value.email });

  if (!user) return next(new CustomError("User not found!", 404));

  const { token, expiresAt } = generateVToken();

  try {
    const emailData = { to: value.email, type: "verifyAccount", token };

    await createEmail(emailData);

    user.actionToken = token;
    user.tokenExpiresAt = expiresAt;
    await user.save();

    return res
      .status(200)
      .json({ message: "Email sent, please check your email!" });
  } catch (e) {
    return next(new CustomError(e.message, 400));
  }
});

const login = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const ip = req.ip;

  const parser = new UAParser();
  parser.setUA(req.headers["user-agent"] || "");
  const uaInfo = parser.getResult();

  const rawUa = uaInfo.ua || "";
  const isHeadlessClient = /postman|curl|axios|fetch|httpclient/i.test(rawUa);

  let deviceInfo;

  if (isHeadlessClient) {
    deviceInfo = "User has logged in using a headless request!";
  } else {
    const browser = uaInfo.browser?.name || "Unknown Browser";
    const browserVersion = uaInfo.browser?.version || "";
    const os = uaInfo.os?.name || "Unknown OS";
    const osVersion = uaInfo.os?.version || "";

    deviceInfo = `${browser} ${browserVersion} on ${os} ${osVersion}`;
  }

  try {
    const { refreshToken, expiresAt } = generateCookies(res, user, {
      includeRefresh: true,
    });
    const session = await Session.findOne({ userId: user._id });

    if (session) {
      session.refreshToken = refreshToken;
      session.expiresAt = expiresAt;
      session.deviceInfo = deviceInfo;
      session.ip = ip;

      await session.save();
      return res.status(200).json(user);
    }

    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt,
      deviceInfo,
      ip,
    });

    return res.status(200).json(user);
  } catch (e) {
    return next(new CustomError("Could not create a session!", 500));
  }
});

const register = handleCreateUser("register");

const createUser = handleCreateUser("create user");

const test = asyncHandler(async (req, res, next) => {
  const parser = new UAParser();
  parser.setUA(req.headers["user-agent"]);
  const uaInfo = parser.getResult();

  const deviceInfo = `${uaInfo.browser.name} ${uaInfo.browser.version} on ${uaInfo.os.name} ${uaInfo.os.version}`;

  const { token } = generateVToken();

  const ip = req.ip;

  return res.status(200).json(token);
});

const softDeleteUser = asyncHandler(async (req, res, next) => {
  const _id = req.user._id;
  const isSuper = req.user.accountType === "super admin";

  if (isSuper) {
    const activeSuperAdmins = await User.countDocuments({
      accountType: "super admin",
      isDeleted: false,
      _id: { $ne: _id },
    });

    if (activeSuperAdmins === 0)
      return next(new CustomError("Cannot delete the last super admin!", 403));
  }

  const user = await User.findById(_id);

  if (!user) return next(new CustomError("User not found!", 404));

  user.isDeleted = true;
  user.deletedAt = Date.now();
  user.status = "suspended";

  await user.save();

  req.cookies("accessToken", "", {
    httpOnly: true,
    expiresAt: new Date(0),
  });

  req.cookies("refreshToken", "", {
    httpOnly: true,
    expiresAt: new Date(0),
  });

  await Session.deleteOne({ userId: user._id });

  res.status(200).json({ message: "User temporarily deleted!" });
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;

  const user = await User.findById(userId);

  if (!user) return next(new CustomError("User not found!", 404));

  await User.deleteOne({ _id: userId });

  res.status(200).json({ message: "User deleted!" });
});

const getUsers = asyncHandler(async (req, res, next) => {
  const { limit, q, skip } = parseQueryParams(req.query);

  let query = {};

  if (q) {
    query.$or = [
      { fullname: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { username: { $regex: q, $options: "i" } },
      { status: { $regex: q, $options: "i" } },
      { accountType: { $regex: q, $options: "i" } },
    ];
  }

  const users = await User.find(query).skip(skip).limit(limit).lean();

  res.status(200).json(users);
});

const getUserById = asyncHandler(async (req, res, next) => {
  const _id = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return next(new CustomError("Invalid ObjectId Format!", 400));

  const user = await User.findById(_id);

  if (!user) return next(new CustomError("User not found!", 404));

  res.json(user);
});

const getProfile = asyncHandler(async (req, res, next) => {
  const user = req.user;

  if (!user) return next(new CustomError("User not found!", 404));

  const profile = {
    fullname: user.fullname,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
  };

  res.status(200).json(profile);
});

const logout = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Session.deleteOne({ userId });

  res.cookie("accessToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logout!" });
});

export {
  register,
  verifyAccount,
  verifyAccountRequest,
  changePasswordRequest,
  changePassword,
  login,
  createUser,
  updateUser,
  softDeleteUser,
  deleteUser,
  getUsers,
  getUserById,
  getProfile,
  logout,
  test,
};
