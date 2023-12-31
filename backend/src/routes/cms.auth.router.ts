import { NextFunction, Request, Response, Router } from "express";
import { validate } from "../utils/helper/validate";
import { LoginValidationSchema, LoginValidationType } from "../utils/validation_schema/auths/login.validation.schema";
import { forgotPasswordService, getSecurityQuestions, loginService, resetPassword, setInitialSecurityQuestion, updatePassword, updateSecurityQuestion, validateEmail } from "../service/cms.auth.service";
import { ForgotPasswordType, ForgotPasswordValidationSchema } from "../utils/validation_schema/cms/forgotPassword.validation.schema";
import { ResetPasswordValidationSchema, ResetPasswordValidationType } from "../utils/validation_schema/cms/resetPassword.validation.schema";
import { SetSecurityQnASchema, SetSecurityQnAType } from "../utils/validation_schema/cms/setSecurityQnA.validation.schema";
import { isDefaultSuperAdmin, isAuthenticated } from "../middleware/auth.middleware";
import { ValidateEmailType, validateEmailSchema } from "../utils/validation_schema/cms/verifyEmail.validation.schema";
import { UpdatePasswordValidationSchema, UpdatePasswordValidationType } from "../utils/validation_schema/cms/updatePassword.validation.schema";
import { UpdateSecurityQnASchema, UpdateSecurityQnAType } from "../utils/validation_schema/cms/updateSecurityQnA.validation.schema";

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

CmsAuthRouter.post("/verifyEmail", validate(validateEmailSchema), async (req: Request<any, any, ValidateEmailType>, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const response = await validateEmail(body);
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

/* ============ Protected Routes ===================== */

CmsAuthRouter.get("/getSecurityQuestions", isAuthenticated, isDefaultSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = getSecurityQuestions();
    res.status(200).json(response);
  } catch (error: unknown) {
    next(error);
  }
});

CmsAuthRouter.post("/setSecurityQuestions", isAuthenticated, isDefaultSuperAdmin, validate(SetSecurityQnASchema), async (req: Request<any, any, SetSecurityQnAType>, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const response = await setInitialSecurityQuestion(body, req.currentUser as any);
    res.status(200).json(response);
  } catch (error: unknown) {
    next(error);
  }
});

CmsAuthRouter.put(
  "/updateSecurityQuestions",
  isAuthenticated,
  isDefaultSuperAdmin,
  validate(UpdateSecurityQnASchema),
  async (req: Request<any, any, UpdateSecurityQnAType>, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const response = await updateSecurityQuestion(body, req.currentUser as any);
      res.status(200).json(response);
    } catch (error: unknown) {
      next(error);
    }
  }
);

CmsAuthRouter.put(
  "/updatePassword",
  isAuthenticated,
  isDefaultSuperAdmin,
  validate(UpdatePasswordValidationSchema),
  async (req: Request<any, any, UpdatePasswordValidationType>, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const response = await updatePassword(body, req.currentUser as any);
      res.status(200).json(response);
    } catch (error: unknown) {
      next(error);
    }
  }
);
