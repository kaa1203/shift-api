import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import "dotenv/config";

const { TOKEN_SECRET, NODE_ENV } = process.env;

const generateVToken = () => {
  const token = nanoid();
  const expiresAt = Date.now() + 15 * 60 * 1000;

  return { token, expiresAt };
};

const generateCookies = (res, user, option = { includeRefresh: true }) => {
  const { _id, email, accountType } = user;
  const payload = { _id, email, accountType };

  const accessToken = jwt.sign(payload, TOKEN_SECRET, { expiresIn: "15m" });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  let refreshToken, expiresAt;

  if (option.includeRefresh) {
    refreshToken = nanoid(32);
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  return { refreshToken, expiresAt };
};

export { generateVToken, generateCookies };
