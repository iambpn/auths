import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { db } from "../schema/drizzle-migrate";
import { RolesSchema } from "../schema/drizzle-schema";
import { ENV_VARS } from "../service/env.service";
import { HttpError } from "../utils/helper/httpError";
import { AuthsRequestUser } from "../utils/types/req.user.type";

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
      // checks token against secret and the expires in time
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

export async function isSuperAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.currentUser) {
      throw new HttpError("Unauthorized Request", 401);
    }

    const [role] = await db.select().from(RolesSchema).where(eq(RolesSchema.slug, "superadmin")).limit(1);

    if (!role || role.uuid !== req.currentUser.role.uuid) {
      throw new HttpError("Insufficient role", 401);
    }

    next();
  } catch (error: unknown) {
    next(error);
  }
}

export function requiredPermissions(permission_slugs: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.currentUser as AuthsRequestUser;
      const isPermitted = currentUser.role.permissions.some((perm) => permission_slugs.includes(perm.slug));

      if (!isPermitted) {
        throw new HttpError("Insufficient permissions", 401);
      }

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
}
