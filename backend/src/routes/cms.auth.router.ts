import { NextFunction, Request, Response, Router } from "express";
import { isAdmin, isAuthenticated } from "../middleware/auth.middleware";
import {
  forgotPasswordService,
  getSecurityQuestions,
  loginService,
  resetPassword,
  setInitialSecurityQuestion,
  updatePassword,
  updateSecurityQuestion,
  validateSuperadminEmail,
} from "../service/auth.cms.service";
import { validate } from "../utils/helper/validate";
import { LoginValidationSchema, LoginValidationType } from "../utils/validation_schema/auths/login.validation.schema";
import { ForgotPasswordType, ForgotPasswordValidationSchema } from "../utils/validation_schema/cms/forgotPassword.validation.schema";
import { ResetPasswordValidationSchema, ResetPasswordValidationType } from "../utils/validation_schema/cms/resetPassword.validation.schema";
import { SetSecurityQnASchema, SetSecurityQnAType } from "../utils/validation_schema/cms/setSecurityQnA.validation.schema";
import { UpdatePasswordValidationSchema, UpdatePasswordValidationType } from "../utils/validation_schema/cms/updatePassword.validation.schema";
import { UpdateSecurityQnASchema, UpdateSecurityQnAType } from "../utils/validation_schema/cms/updateSecurityQnA.validation.schema";
import { ValidateEmailType, validateEmailSchema } from "../utils/validation_schema/cms/verifyEmail.validation.schema";

export const CmsAuthRouter = Router();

CmsAuthRouter.post(
  "/login",
  validate(LoginValidationSchema),
  async (req: Request<any, any, LoginValidationType>, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const response = await loginService(body.email, body.password);
      res.status(200).json(response);
    } catch (error: unknown) {
      next(error);
    }
  }
);

// verify email form forger password
CmsAuthRouter.post(
  "/verifyEmail",
  validate(validateEmailSchema),
  async (req: Request<any, any, ValidateEmailType>, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const response = await validateSuperadminEmail(body);
      res.status(200).json(response);
    } catch (error: unknown) {
      next(error);
    }
  }
);

CmsAuthRouter.post(
  "/forgotPassword",
  validate(ForgotPasswordValidationSchema),
  async (req: Request<any, any, ForgotPasswordType>, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const response = await forgotPasswordService(body);
      res.status(200).json(response);
    } catch (error: unknown) {
      next(error);
    }
  }
);

CmsAuthRouter.post(
  "/resetPassword",
  validate(ResetPasswordValidationSchema),
  async (req: Request<any, any, ResetPasswordValidationType>, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const response = await resetPassword(body);
      res.status(200).json(response);
    } catch (error: unknown) {
      next(error);
    }
  }
);

/* ============ Protected Routes ===================== */

CmsAuthRouter.get("/getSecurityQuestions", isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = getSecurityQuestions();
    res.status(200).json(response);
  } catch (error: unknown) {
    next(error);
  }
});

CmsAuthRouter.post(
  "/setSecurityQuestions",
  isAuthenticated,
  isAdmin,
  validate(SetSecurityQnASchema),
  async (req: Request<any, any, SetSecurityQnAType>, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const response = await setInitialSecurityQuestion(body, req.currentUser as any);
      res.status(200).json(response);
    } catch (error: unknown) {
      next(error);
    }
  }
);

CmsAuthRouter.put(
  "/updateSecurityQuestions",
  isAuthenticated,
  isAdmin,
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
  isAdmin,
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
