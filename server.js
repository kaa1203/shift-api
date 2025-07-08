import mongoose from "mongoose";
import "dotenv/config";
import app from "./app.js";

const { DB_HOST, PORT } = process.env;

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(DB_HOST);
    console.log(`Connected to: ${conn.connection.host}`);
    app.listen(PORT, () => {
      console.log(`Listening to port: ${PORT}`);
    });
  } catch (e) {
    console.error(`Connection Failed: ${e.message}`);
    process.exit(1);
  }
};

connectDb();
