import express, { type NextFunction, type Request, type Response, type Express } from "express";
import * as path from "path";
import { z } from "zod";
import { AuthsRouter } from "./routes/exposed/auth.router";
import { migrateDB } from "./schema/drizzle-migrate";
import { HttpError } from "./utils/helper/httpError";
import { ErrorResponse } from "./utils/types/errorResponse";
import { ENV_VARS, validateEnv } from "./service/env.service";
import { runSeed } from "./service/seed.service";
import { CmsAuthRouter } from "./routes/cms.auth.router";
import { PermissionRouter } from "./routes/permission.router";
import { RolesRouter } from "./routes/roles.router";
import url from "url";
import { UsersRouter } from "./routes/users.router";

const FRONTEND_PATH = path.join(__dirname, "..", "public", "frontend", "build");

export function authsInit(app: Express, permissionFilePath?: string) {
  // validate Env
  validateEnv();

  // Body parser
  app.use(express.urlencoded({ extended: true, limit: 5 * 1024 }));
  app.use(express.json());

  // Migrate and instantiate db
  migrateDB(ENV_VARS.AUTHS_DB_URI);

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

export { signUpFn as signup, loginFn as login, validateUser, initiateForgotPasswordFn as initiateForgotPassword } from "./service/auth.service";
export { isAuthenticated, requiredPermissions } from "./middleware/auth.middleware";
export type { AuthsRequestUser } from "./utils/types/req.user.type";
