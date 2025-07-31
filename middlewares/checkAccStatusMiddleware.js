import asyncHandler from "express-async-handler";

import { loginValidation } from "../utils/validator.js";
import { CustomError } from "./errorMiddleware.js";
import { User } from "../models/usersModel.js";

const checkAccountStatus = asyncHandler(async (req, _res, next) => {
  const { error, value } = loginValidation(req.body);
  const { identifier, password } = value;

  if (error) return next(new CustomError(error.message, 400));

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!user || !(await user.matchPassword(password)))
    return next(new CustomError("Wrong email/username or password!", 401));

  req.user = user;

  next();
});

export default checkAccountStatus;
