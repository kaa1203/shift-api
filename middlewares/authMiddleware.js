import asyncHandler from "express-async-handler";
import "dotenv/config";
import jwt from "jsonwebtoken";

import { CustomError } from "./errorMiddleware.js";
import { User } from "../models/usersModel.js";
import { Session } from "../models/sessionsModel.js";
import { generateCookies } from "../utils/tokenGenerator.js";
import { checkParam } from "../utils/check.js";

const { TOKEN_SECRET } = process.env;

const authenticate = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = req.cookies.accessToken;

  // Check refresh token
  if (!refreshToken)
    return next(new CustomError("Authentication required. Please login.", 401));

  // Proceed if req.user is already set
  if (req.user) return next();

  // Check and verify access token
  if (accessToken) {
    try {
      const decodedAccessToken = jwt.verify(accessToken, TOKEN_SECRET);
      req.user = await User.findById(decodedAccessToken._id);

      if (!req.user) throw new CustomError("User not found", 404);

      return next();
    } catch (e) {
      if (e.name === "TokenExpiredError") {
        const decoded = jwt.decode(accessToken);
        const user = await User.findById(decoded?._id);

        generateCookies(res, user, { includeRefresh: false });

        req.user = user;
        return next();
      }

      return next(new CustomError("Invalid Access token!", 401));
    }
  }

  // Check session and set up cookie
  try {
    const session = await Session.findOne({ refreshToken });
    // console.log("has reftoken");
    if (!session) return next(new CustomError("Invalid session", 401));

    if (session.expiresAt < new Date())
      return next(new CustomError("Session expired! please login again.", 401));

    const user = await User.findById(session.userId);

    checkParam(user, "user");

    generateCookies(res, user, { includeRefresh: false });

    req.user = user;

    return next();
  } catch (e) {
    console.error("Auth error:", e.message);
    return next(new CustomError("Invalid refresh token!", 401));
  }
});

export default authenticate;
