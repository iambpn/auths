import { NextFunction, Request, Response, Router } from "express";
import { isAuthenticated, isSuperAdmin } from "../middleware/auth.middleware";
import { validate } from "../utils/helper/validate";
import { CreatePermissionType, createPermissionValidationSchema } from "../utils/validation_schema/cms/createPermission.validation.schema";
import { GetByIdType, getByIdValidationSchema } from "../utils/validation_schema/cms/getById.validation.schema";
import { PaginationType, paginationValidationSchema } from "../utils/validation_schema/cms/pagination.validation.schema";
import { assignRolesToPermission, createPermission, deletePermission, getAllPermission, getPermissionById, getRolesByPermission, updatePermission } from "../service/premission.service";
import { PaginationQuery } from "../utils/helper/parsePagination";
import { AssignRoleToPermissionType, assignRoleToPermissionValidationSchema } from "../utils/validation_schema/cms/assignRoleToPermission.validation.schema";
import { SearchQueryValidationSchema, SearchQueryType } from "../utils/validation_schema/cms/queryParams.validation.schema";

export const PermissionRouter = Router();

PermissionRouter.get(
  "/",
  isAuthenticated,
  isSuperAdmin,
  validate(paginationValidationSchema, "query"),
  validate(SearchQueryValidationSchema, "query"),
  async (req: Request<any, any, any, PaginationType & SearchQueryType>, res: Response, next: NextFunction) => {
    try {
      const query = req.query;
      const result = await getAllPermission(PaginationQuery(query), query.keyword);
      return res.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  }
);

PermissionRouter.get(
  "/:id/roles",
  isAuthenticated,
  isSuperAdmin,
  validate(paginationValidationSchema, "query"),
  validate(getByIdValidationSchema, "params"),
  async (req: Request<any, any, any, PaginationType & GetByIdType>, res: Response, next: NextFunction) => {
    try {
      const query = req.query;
      const params = req.params;
      const result = await getRolesByPermission(params.id, PaginationQuery(query));
      return res.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  }
);

PermissionRouter.get("/:id", isAuthenticated, isSuperAdmin, validate(getByIdValidationSchema, "params"), async (req: Request<GetByIdType>, res: Response, next: NextFunction) => {
  try {
    const params = req.params;
    const result = await getPermissionById(params.id);
    return res.status(200).json(result);
  } catch (error: unknown) {
    next(error);
  }
});

PermissionRouter.post("/", isAuthenticated, isSuperAdmin, validate(createPermissionValidationSchema), async (req: Request<any, any, CreatePermissionType>, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const result = await createPermission(body);
    return res.status(201).json(result);
  } catch (error: unknown) {
    next(error);
  }
});

PermissionRouter.put(
  "/:id",
  isAuthenticated,
  isSuperAdmin,
  validate(createPermissionValidationSchema),
  validate(getByIdValidationSchema, "params"),
  async (req: Request<GetByIdType, any, CreatePermissionType>, res: Response, next: NextFunction) => {
    try {
      const params = req.params;
      const body = req.body;

      const result = await updatePermission(params.id, body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

PermissionRouter.delete("/:id", isAuthenticated, isSuperAdmin, validate(getByIdValidationSchema, "params"), async (req: Request<GetByIdType>, res: Response, next: NextFunction) => {
  try {
    const params = req.params;

    const result = await deletePermission(params.id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

PermissionRouter.post(
  "/assignRoles/:id",
  isAuthenticated,
  isSuperAdmin,
  validate(getByIdValidationSchema, "params"),
  validate(assignRoleToPermissionValidationSchema),
  async (req: Request<GetByIdType, any, AssignRoleToPermissionType>, res: Response, next: NextFunction) => {
    try {
      const params = req.params;
      const body = req.body;

      const result = await assignRolesToPermission(params.id, body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);
