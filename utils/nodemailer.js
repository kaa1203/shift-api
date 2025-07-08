import nodemailer from "nodemailer";
import "dotenv/config";

const { GMAIL_EMAIL, GMAIL_PASS } = process.env;

const nodemailerConfig = {
  service: "Gmail",
  name: "smtp.gmail.com",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: GMAIL_EMAIL, pass: GMAIL_PASS },
};

const transport = nodemailer.createTransport(nodemailerConfig);

export const sendEmail = async (data) => {
  const email = { ...data, from: GMAIL_EMAIL };
  await transport.sendMail(email);
};
