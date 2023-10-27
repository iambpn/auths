import express, { type NextFunction, type Request, type Response, type Express } from "express";
import * as path from "path";
import { z } from "zod";
import { AuthsRouter } from "./routes/auth.router";
import { migrateDB } from "./schema/drizzle-migrate";
import { HttpError } from "./utils/helper/httpError";
import { ErrorResponse } from "./utils/types/errorResponse";
import { ENV_VARS, validateEnv } from "./service/env.service";
import { seedPermission } from "./service/seedPermission.service";
import { CmsAuthRouter } from "./routes/cms.auth.router";
import { PermissionRouter } from "./routes/permission.router";
import { RolesRouter } from "./routes/roles.router";

const FRONTEND_PATH = path.join(__dirname, "..", "public", "frontend", "build");

export function authsInit(app: Express, permissionFile?: string) {
  // validate Env
  validateEnv();

  // Body parser
  app.use(express.urlencoded({ extended: true, limit: 5 * 1024 }));
  app.use(express.json());

  app.use((req, resm,next)=>{console.log(req.path); next()});

  // Migrate and instantiate db
  migrateDB(ENV_VARS.AUTHS_DB_URI);

  // Seed Permissions from file
  seedPermission(permissionFile);

  // Adding Routes
  app.use("/api/auths", AuthsRouter);
  app.use("/api/auths/cms", CmsAuthRouter);
  app.use("/api/auths/permission", PermissionRouter);
  app.use("/api/auths/roles", RolesRouter);

  // server prod frontend build
  app.use("/auths", express.static(FRONTEND_PATH));

  // serve prod index.html in * path
  app.get("/auths/*", (req: Request, res: Response) => {
    return res.sendFile(path.join(FRONTEND_PATH, "index.html"));
  });

  // route not found error handler
  app.use("/api/auths/*", (req: Request, res: Response, next: any) => {
    next(new HttpError("Invalid URL " + req.path, 404));
  });

  // Custom Error Handler for /auths route
  app.use("/api/auths/*", (error: unknown, req: Request, res: Response<ErrorResponse>, next: NextFunction) => {
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

export { signUpFn as signup, loginFn as login, validateUser, initiateForgotPasswordFn as initiateForgotPassword } from "./service/auth.service";
export { isAuthenticated } from "./middleware/auth.middleware";
