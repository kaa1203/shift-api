import express, { urlencoded, json } from "express";
import cors from "cors";
import logger from "morgan";
import cookieParser from "cookie-parser";
import "dotenv/config";

import { router as entriesRoute } from "./routes/api/entriesRoutes.js";
import { router as usersRoute } from "./routes/api/usersRoutes.js";

import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";

const app = express();

const formatLogger = app.get("env") === "development" ? "dev" : "short";

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(logger(formatLogger));
app.use(cors());

app.use("/api/entries", entriesRoute);	
app.use("/api/users", usersRoute);

app.use(notFound);
app.use(errorHandler);

export default app;
