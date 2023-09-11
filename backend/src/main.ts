import express, { type NextFunction, type Request, type Response, type Express } from "express";
import * as path from "path";
import { z } from "zod";
import { router } from "./routes/auth.router";
import { migrateDB } from "./schema/drizzle-migrate";
import { HttpError } from "./utils/helper/httpError";
import { ErrorResponse } from "./utils/types/errorResponse";
import { ENV_VARS, validateEnv } from "./service/env.service";

const FRONTEND_PATH = path.join(__dirname, "..", "public", "frontend", "build");

export function authsInit(app: Express) {
  // validate Env
  validateEnv();

  // Body parser
  app.use(express.urlencoded({ extended: true, limit: 5 * 1024 }));
  app.use(express.json());

  // Migrate and instantiate db
  migrateDB(ENV_VARS.AUTHS_DB_URI);

  // Adding Routes
  app.use("/auths/api", router);

  // server prod frontend build
  app.use("/auths", express.static(FRONTEND_PATH));

  // serve prod index.html in * path
  app.get("/auths/*", (req: Request, res: Response) => {
    return res.sendFile(path.join(FRONTEND_PATH, "index.html"));
  });

  // route not found error handler
  app.use("/auths/*", (req: Request, res: Response) => {
    throw new HttpError("Invalid URL " + req.path, 404);
  });

  // Custom Error Handler for /auths route
  app.use("/auths/*", (error: unknown, req: Request, res: Response<ErrorResponse>, next: NextFunction) => {
    const errorObj: ErrorResponse = {
      errors: {} as any,
      path: req.path,
      time: new Date(),
    };
    let statusCode = 500;

    console.error(error);
    if (error instanceof z.ZodError) {
      statusCode = 400;
      errorObj.errors = error.format();
    } else if (error instanceof HttpError) {
      statusCode = error.statusCode;
      errorObj.errors = { _errors: [error.message] };
    } else {
      statusCode = 500;
      errorObj.errors = { _errors: ["Internal Server Error"] };
    }

    return res.status(statusCode).json(errorObj);
  });
}

export { signUpFn as signup, loginFn as login } from "./service/auth.service";
export { isAuthenticated } from "./middleware/auth.middleware";
