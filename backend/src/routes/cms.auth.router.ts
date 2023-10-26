import { NextFunction, Request, Response, Router } from "express";
import { validate } from "../utils/helper/validate";
import { LoginValidationSchema, LoginValidationType } from "../utils/validation_schema/auths/login.validation.schema";
import { forgotPasswordService, loginService, resetPassword, setInitialSecurityQuestion } from "../service/cms.auth.service";
import { ForgotPasswordType, ForgotPasswordValidationSchema } from "../utils/validation_schema/cms/forgotPassword.validation.schema";
import { ResetPasswordValidationSchema, ResetPasswordValidationType } from "../utils/validation_schema/cms/resetPassword.validation.schema";
import { SetSecurityQnASchema, SetSecurityQnAType } from "../utils/validation_schema/cms/setSecurityQnA.validation.schema";
import { isSuperAdmin, isAuthenticated } from "../middleware/auth.middleware";

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

CmsAuthRouter.post("/resetPassword", validate(ResetPasswordValidationSchema), async (req: Request<any, any, ResetPasswordValidationType>, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const response = await resetPassword(body);
    res.status(200).json(response);
  } catch (error: unknown) {
    next(error);
  }
});

CmsAuthRouter.post("/setSecurityQnA", isAuthenticated, isSuperAdmin, validate(SetSecurityQnASchema), async (req: Request<any, any, SetSecurityQnAType>, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const response = await setInitialSecurityQuestion(body, req.currentUser as any);
    res.status(200).json(response);
  } catch (error: unknown) {
    next(error);
  }
});
