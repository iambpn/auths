import { NextFunction, Request, Response, Router } from "express";
import { isAuthenticated, isSuperAdmin } from "../middleware/auth.middleware";
import { validate } from "../utils/helper/validate";
import { GetByIdType, getByIdValidationSchema } from "../utils/validation_schema/cms/getById.validation.schema";
import { CreateRoleType, createRoleValidationSchema } from "../utils/validation_schema/cms/createRole.validation.schema";
import { PaginationType, paginationValidationSchema } from "../utils/validation_schema/cms/pagination.validation.schema";
import { assignPermissionsToRole, createRole, deleteRole, getAllRoles, getRoleById, updateRole } from "../service/roles.service";
import { PaginationQuery } from "../utils/helper/parsePagination";
import { AssignPermissionToRoleType, assignPermissionToRoleValidationSchema } from "../utils/validation_schema/cms/assignPermissionToRole.validation.schema";
import { SearchQueryType, SearchQueryValidationSchema, WithPermissionType, WithPermissionValidationSchema } from "../utils/validation_schema/cms/queryParams.validation.schema";

export const RolesRouter = Router();

RolesRouter.get(
  "/",
  isAuthenticated,
  isSuperAdmin,
  validate(paginationValidationSchema, "query"),
  validate(SearchQueryValidationSchema, "query"),
  validate(WithPermissionValidationSchema, "query"),
  async (req: Request<any, any, any, PaginationType & SearchQueryType & WithPermissionType>, res: Response, next: NextFunction) => {
    try {
      const query = req.query;
      const result = await getAllRoles(PaginationQuery(query), query.keyword, query.withPermission ?? "true");
      return res.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  }
);

RolesRouter.get("/:id", isAuthenticated, isSuperAdmin, validate(getByIdValidationSchema, "params"), async (req: Request<GetByIdType>, res: Response, next: NextFunction) => {
  try {
    const params = req.params;
    const result = await getRoleById(params.id);
    return res.status(200).json(result);
  } catch (error: unknown) {
    next(error);
  }
});

RolesRouter.post("/", isAuthenticated, isSuperAdmin, validate(createRoleValidationSchema), async (req: Request<any, any, CreateRoleType>, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const result = await createRole(body);
    return res.status(201).json(result);
  } catch (error: unknown) {
    next(error);
  }
});

RolesRouter.put(
  "/:id",
  isAuthenticated,
  isSuperAdmin,
  validate(createRoleValidationSchema),
  validate(getByIdValidationSchema, "params"),
  async (req: Request<GetByIdType, any, CreateRoleType>, res: Response, next: NextFunction) => {
    try {
      const params = req.params;
      const body = req.body;

      const result = await updateRole(params.id, body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

RolesRouter.delete("/:id", isAuthenticated, isSuperAdmin, validate(getByIdValidationSchema), async (req: Request<GetByIdType>, res: Response, next: NextFunction) => {
  try {
    const params = req.params;

    const result = await deleteRole(params.id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

RolesRouter.post(
  "/assignPermission/:id",
  isAuthenticated,
  isSuperAdmin,
  validate(getByIdValidationSchema, "params"),
  validate(assignPermissionToRoleValidationSchema),
  async (req: Request<GetByIdType, any, AssignPermissionToRoleType>, res: Response, next: NextFunction) => {
    try {
      const params = req.params;
      const body = req.body;

      const result = await assignPermissionsToRole(params.id, body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);
