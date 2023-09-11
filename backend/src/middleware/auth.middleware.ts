import { type Request, type Response, type NextFunction } from "express";
import { HttpError } from "../utils/helper/httpError";
import * as jwt from "jsonwebtoken";
import { ENV_VARS } from "../service/env.service";

/**
 * Check if user is authenticated via bearer token.
 * @param req
 * @param res
 * @param next
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.headers["authorization"]) {
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      throw new HttpError("Unauthorized Request", 401);
    }

    try {
      const decoded = jwt.verify(token, ENV_VARS.AUTHS_SECRET);
      req.currentUser = decoded as any;
      next();
    } catch (error: unknown) {
      console.error(error);
      throw new HttpError("Unauthorized Request", 401);
    }
  } else {
    throw new HttpError("Unauthorized Request", 401);
  }
}
