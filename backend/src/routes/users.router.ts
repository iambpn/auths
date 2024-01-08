import { NextFunction, Request, Response, Router } from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware";
import { getAllRoles, getRoleById } from "../service/roles.service";
import { PaginationQuery } from "../utils/helper/parsePagination";
import { validate } from "../utils/helper/validate";
import { PaginationType, paginationValidationSchema } from "../utils/validation_schema/cms/pagination.validation.schema";
import { getAllUsers } from "../service/users.service";
import { CreateUserType, createUserValidationSchema } from "../utils/validation_schema/cms/createUser.validation.schema";
import { signUpFn } from "../service/auth.service";

export const UsersRouter = Router();

UsersRouter.post(
  "/",
  isAuthenticated,
  isAdmin,
  validate(createUserValidationSchema, "body"),
  async (req: Request<any, any, CreateUserType>, res: Response, next: NextFunction) => {
    try {
      const body = req.body;

      // validate Role
      // throws Role not found error
      const role = await getRoleById(body.role);

      const response = await signUpFn(body.email, body.password, role.slug);
      res.status(200).json(response);
    } catch (error: unknown) {
      next(error);
    }
  }
);

UsersRouter.get(
  "/",
  isAuthenticated,
  isAdmin,
  validate(paginationValidationSchema, "query"),
  async (req: Request<any, any, any, PaginationType>, res: Response, next: NextFunction) => {
    try {
      const query = req.query;
      const result = await getAllUsers(PaginationQuery(query));
      return res.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  }
);
