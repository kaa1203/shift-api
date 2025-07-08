import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import "dotenv/config";

const { TOKEN_SECRET } = process.env;

const generateVToken = () => {
  const token = nanoid();
  const expiresAt = Date.now() + 15 * 60 * 1000;

  return { token, expiresAt };
};

const generateToken = (res, user) => {
  const {} = user;
};

export { generateVToken };
