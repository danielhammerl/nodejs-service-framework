import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import config from "./config";

import ErrorHandlerMiddleware from "./util/middleware/ErrorHandler";
import { logError } from "./util/logError";

dotenv.config({});

const app = express();

app.use(bodyParser.json());
app.get("/health", (req, res) => res.status(200).send());

app.use(express.json());

app.use(ErrorHandlerMiddleware);

app.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});

process.on("uncaughtException", (err) => {
  logError("process.on uncaughtException", err).finally(() => {
    console.error(`Uncaught exception: ${err.stack}`);
    process.exit(1);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  process.exit(0);
});
