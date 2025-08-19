import crypto from "crypto";
import "dotenv/config";

const { ENC_SECRET } = process.env;

const ALGORITHM = "aes-256-cbc";
const KEY = Buffer.from(ENC_SECRET, "hex");
const IV_LENGTH = 16;

const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};

const decrypt = (enc) => {
  const [ivHex, encryptedText] = enc.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
};

export { encrypt, decrypt };
