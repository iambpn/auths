import { NextFunction, Request, Response, Router } from "express";
import { validate } from "../utils/helper/validate";
import { LoginValidationSchema, LoginValidationType } from "../utils/validation_schema/auths/login.validation.schema";
import { forgotPasswordService, loginService } from "../service/cms.auth.service";
import { ForgotPasswordType, ForgotPasswordValidationSchema } from "../utils/validation_schema/cms/forgotPassword.validation.schema";

export const CmsAuthRouter = Router();

CmsAuthRouter.post("/login", validate(LoginValidationSchema), async (req: Request<any, any, LoginValidationType>, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const response = await loginService(body.email, body.password);
    res.status(200).json(response);
  } catch (error: unknown) {
    next(error);
  }
});

CmsAuthRouter.post("/forgotPassword", validate(ForgotPasswordValidationSchema), async (req: Request<any, any, ForgotPasswordType>, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const response = await forgotPasswordService(body);
    res.status(200).json(response);
  } catch (error: unknown) {
    next(error);
  }
});
