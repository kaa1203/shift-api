import mongoose from "mongoose";
import { CustomError } from "../middlewares/errorMiddleware.js";

const isIdValid = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new CustomError("Invalid ObjectId Format!", 400);
};

const checkParam = (param, paramName) => {
  if (!param)
    throw new CustomError(
      `${paramName.charAt(0).toUpperCase() + paramName.slice(1)} not found!`,
      404
    );
};

const hasError = (error) => {
  if (error) throw new CustomError(error.message, 400);
};

export { isIdValid, checkParam, hasError };
