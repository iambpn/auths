import express, { type Express, type NextFunction, type Request, type Response } from "express";
import * as path from "path";
import url from "url";
import { z } from "zod";
import { migrateDB } from "./dbSchema/drizzle-migrate";
import { initializeSchema } from "./dbSchema/drizzle-schema";
import { CmsAuthRouter } from "./routes/cms.auth.router";
import { AuthsRouter } from "./routes/exposed/auth.router";
import { PermissionRouter } from "./routes/permission.router";
import { RolesRouter } from "./routes/roles.router";
import { UsersRouter } from "./routes/users.router";
import { ENV_VARS, validateEnv } from "./service/env.service";
import { runSeed } from "./service/seed.service";
import { HttpError } from "./utils/helper/httpError";
import { ErrorResponse } from "./utils/types/errorResponse";

const FRONTEND_PATH = path.join(__dirname, "..", "public", "frontend", "build");

export async function authsInit(app: Express, permissionFilePath?: string) {
  // validate Env
  validateEnv();

  // Body parser
  app.use(express.urlencoded({ extended: true, limit: 5 * 1024 }));
  app.use(express.json());

  // Initialize Schema according to Driver
  initializeSchema();

  // Migrate and instantiate db
  await migrateDB(ENV_VARS.AUTHS_DB_DRIVER, path.join(__dirname, "../drizzle", ENV_VARS.AUTHS_DB_DRIVER));

  // Run default Seed
  runSeed(permissionFilePath);

  // Adding Routes
  app.use("/auths/api", AuthsRouter);
  app.use("/auths/api/cms", CmsAuthRouter);
  app.use("/auths/api/users", UsersRouter);
  app.use("/auths/api/permission", PermissionRouter);
  app.use("/auths/api/roles", RolesRouter);

  // route not found error handler
  app.use("/auths/api/*", (req: Request, res: Response, next: any) => {
    const fullUrl = url.format({
      protocol: req.protocol,
      host: req.get("host"),
      pathname: req.originalUrl,
    });

    next(new HttpError(`Invalid URL: [${req.method}] ${fullUrl}`, 404));
  });

  // Custom Error Handler for /auths/api/* route
  app.use("/auths/api/*", (error: unknown, req: Request, res: Response<ErrorResponse>, next: NextFunction) => {
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

  // server prod frontend build
  app.use("/auths", express.static(FRONTEND_PATH));

  // serve prod index.html in * path
  app.get("/auths/*", (req: Request, res: Response) => {
    return res.sendFile(path.join(FRONTEND_PATH, "index.html"));
  });
}

export { isAuthenticated, requiredPermissions } from "./middleware/auth.middleware";
export { initiateForgotPasswordFn as initiateForgotPassword, loginFn as login, signUpFn as signup, validateUser } from "./service/auth.service";
export { getUserById } from "./service/users.service";
export type { AuthsRequestUser } from "./utils/types/req.user.type";
