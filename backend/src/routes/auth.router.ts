import { NextFunction, Request, Response, Router } from "express";
import { validate } from "../utils/helper/validate";
import { LoginValidationSchema, LoginValidationType } from "../utils/validation_schema/login.validation.schema";
import { getLoginToken, resetPassword } from "../service/auth.service";
import { ResetPasswordValidationSchema, ResetPasswordValidationType } from "../utils/validation_schema/resetPassword.validation.schema";

export const AuthsRouter = Router();

AuthsRouter.post("/login", validate(LoginValidationSchema), async (req: Request<any, any, LoginValidationType>, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const response = await getLoginToken(body.email, body.password);
    res.status(200).json(response);
  } catch (error: unknown) {
    next(error);
  }
});

AuthsRouter.post("/resetPassword", validate(ResetPasswordValidationSchema), async (req: Request<any, any, ResetPasswordValidationType>, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const response = await resetPassword(body.token, body.email, body.newPassword);
    res.status(200).json(response);
  } catch (error: unknown) {
    next(error);
  }
});
