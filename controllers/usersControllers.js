import asyncHandler from "express-async-handler";
import { loginValidation, registerValidation } from "../utils/validator.js";

import { CustomError } from "../middlewares/errorMiddleware.js";
import { User } from "../models/usersModel.js";

import createEmail from "../utils/createEmail.js";
import { generateVToken } from "../utils/tokenGenerator.js";

const createUser = (status) =>
  asyncHandler(async (req, res, next) => {
    const { value, error } = registerValidation(req.body);
    const { email, username } = value;

    if (error) return next(new CustomError(error.message, 400));

    const existingUser = await User.findOne({
      $or: [{ email, username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return next(new CustomError("Email is already taken!", 400));
      }
      if (existingUser.username === username) {
        return next(new CustomError("Username is already taken!", 400));
      }
    }

    if (status === "suspended") {
      const { token, expiresAt } = generateVToken();

      value.actionToken = token;
      value.actionTokenExpiry = expiresAt;

      const data = {
        to: value.email,
        type: "verifyAccount",
        token,
      };

      createEmail(data);
    }

    value.status = status;

    res.status(201).json(await User.create(value));
  });

const register = createUser("suspended");

const verifyAccount = asyncHandler(async (req, res, next) => {
  const token = req.params.token;

  if (!token) return next(new CustomError("Missing token!", 400));

  const user = await User.findOne({ actionToken: token });

  if (!user) return next(new CustomError("Token is not valid!", 400));

  if (user.tokenExpiresAt < new Date())
    return next(new CustomError("Token is expired, please try again!", 400));

  user.status = "active";
  user.isVerified = true;
  user.actionToken = undefined;
  user.tokenExpiresAt = undefined;

  await user.save();

  res
    .status(200)
    .send({ message: "Congratulations your are now a verified user!" });
});

const login = asyncHandler(async (req, res, next) => {
  const { value, error } = loginValidation(req.body);
});

const addUser = createUser("active");

const editUser = asyncHandler(async () => {});

const softDeleteUser = asyncHandler(async () => {});

const deleteUser = asyncHandler(async () => {});

const getUsers = asyncHandler(async () => {});

const getUserById = asyncHandler(async () => {});

const getProfile = asyncHandler(async () => {});

const editProfile = asyncHandler(async () => {});

const deleteProfile = asyncHandler(async () => {});

const logout = asyncHandler(async () => {});

export {
  register,
  verifyAccount,
  login,
  addUser,
  editUser,
  softDeleteUser,
  deleteUser,
  getUsers,
  getUserById,
  getProfile,
  editProfile,
  deleteProfile,
  logout,
};
