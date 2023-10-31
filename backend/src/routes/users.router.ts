import { NextFunction, Request, Response, Router } from "express";
import { isAuthenticated, isSuperAdmin } from "../middleware/auth.middleware";
import { getAllRoles } from "../service/roles.service";
import { PaginationQuery } from "../utils/helper/parsePagination";
import { validate } from "../utils/helper/validate";
import { PaginationType, paginationValidationSchema } from "../utils/validation_schema/cms/pagination.validation.schema";
import { getAllUsers } from "../service/users.service";

export const UsersRouter = Router();

UsersRouter.get("/", isAuthenticated, isSuperAdmin, validate(paginationValidationSchema, "query"), async (req: Request<any, any, any, PaginationType>, res: Response, next: NextFunction) => {
  try {
    const query = req.query;
    const result = await getAllUsers(PaginationQuery(query));
    return res.status(200).json(result);
  } catch (error: unknown) {
    next(error);
  }
});
