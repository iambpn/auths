import { Router } from "express";
import { validate } from "../utils/helper/validate";
import { Request, Response } from "express";
import { GetByIdType, getByIdValidationSchema } from "../utils/validation_schema/cms/getById.validation.schema";
import { isAuthenticated } from "../middleware/auth.middleware";
import { CreatePermissionType, createPermissionValidationSchema } from "../utils/validation_schema/cms/createPremission.validation.schema";

export const PermissionRouter = Router();

PermissionRouter.get("/", isAuthenticated, () => {});
PermissionRouter.get("/:id", isAuthenticated, validate(getByIdValidationSchema, "path"), (req: Request<GetByIdType>, res: Response) => {});
PermissionRouter.post("/", isAuthenticated, validate(createPermissionValidationSchema), (req: Request<any, any, CreatePermissionType>, res: Response) => {});

PermissionRouter.put(
  "/:id",
  isAuthenticated,
  validate(createPermissionValidationSchema),
  validate(getByIdValidationSchema),
  (req: Request<GetByIdType, any, CreatePermissionType>, res: Response) => {}
);

PermissionRouter.delete("/:id", isAuthenticated, validate(getByIdValidationSchema), (req: Request<GetByIdType>, res: Response) => {});
