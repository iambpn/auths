import { NextFunction, Request, Response, Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware";
import { validate } from "../utils/helper/validate";
import { GetByIdType, getByIdValidationSchema } from "../utils/validation_schema/cms/getById.validation.schema";
import { CreateRoleType, createRoleValidationSchema } from "../utils/validation_schema/cms/createRole.validation.schema";
import { PaginationType, paginationValidationSchema } from "../utils/validation_schema/cms/pagination.validation.schema";
import { assignPermission, createRole, deleteRole, getAllRoles, getRoleById, updateRole } from "../service/roles.service";
import { PaginationQuery } from "../utils/helper/parsePagination";
import { AssignPermissionToRoleType, assignPermissionToRoleValidationSchema } from "../utils/validation_schema/cms/assignPermissionToRole.validation.schema";

export const RolesRouter = Router();

RolesRouter.get("/", isAuthenticated, validate(paginationValidationSchema, "query"), async (req: Request<any, any, any, PaginationType>, res: Response, next: NextFunction) => {
  try {
    const query = req.query;
    const result = await getAllRoles(PaginationQuery(query));
    return res.status(200).json(result);
  } catch (error: unknown) {
    next(error);
  }
});

RolesRouter.get("/:id", isAuthenticated, validate(getByIdValidationSchema, "path"), async (req: Request<GetByIdType>, res: Response, next: NextFunction) => {
  try {
    const params = req.params;
    const result = await getRoleById(params.id);
    return res.status(200).json(result);
  } catch (error: unknown) {
    next(error);
  }
});

RolesRouter.post("/", isAuthenticated, validate(createRoleValidationSchema), async (req: Request<any, any, CreateRoleType>, res: Response, next: NextFunction) => {
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
  validate(createRoleValidationSchema),
  validate(getByIdValidationSchema),
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

RolesRouter.delete("/:id", isAuthenticated, validate(getByIdValidationSchema), async (req: Request<GetByIdType>, res: Response, next: NextFunction) => {
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
  validate(getByIdValidationSchema),
  validate(assignPermissionToRoleValidationSchema),
  async (req: Request<GetByIdType, any, AssignPermissionToRoleType>, res: Response, next: NextFunction) => {
    try {
      const params = req.params;
      const body = req.body;

      const result = await assignPermission(params.id, body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);
