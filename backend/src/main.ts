import express, { NextFunction, Request, Response, type Express } from "express";
import * as path from "path";
import { z } from "zod";
import { router } from "./routes/auth.router";
import { migrateDB } from "./schema/drizzle-migrate";
import { instantiateDB } from "./schema/kysley-instance";
import { formatZodError } from "./utils/helper/formatZodError";
import { HttpError } from "./utils/helper/httpError";

const FRONTEND_PATH = path.join(__dirname, "..", "public", "frontend", "build");

export function authsInit(app: Express) {
  // Migrate db
  migrateDB(process.env.AUTHS_DB_URI);

  // Create DB Instance
  instantiateDB(process.env.AUTHS_DB_URI);

  // Adding Routes
  app.use("/auths/api", router);

  // server prod frontend build
  app.use("/auths", express.static(FRONTEND_PATH));

  // serve prod index.html in * path
  app.get("/auths/*", (req, res) => {
    return res.sendFile(path.join(FRONTEND_PATH, "index.html"));
  });

  // Custom Error Handler for /auths route
  app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: formatZodError(error),
      });
    } else if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        error: [error.message],
      });
    } else {
      return res.status(500).json({
        error: [(error instanceof Error ? error.message : error) ?? "Internal Server Error"],
      });
    }
  });
}
