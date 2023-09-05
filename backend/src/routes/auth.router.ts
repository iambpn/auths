import { Request, Response, Router } from "express";
import { validate } from "../utils/helper/validate";
import { LoginValidationSchema, LoginValidationType } from "../utils/validation_schema/login.schema";
import { login } from "../service/auth.service";

export const router = Router();

router.post("/login", validate(LoginValidationSchema), async (req: Request<any, any, LoginValidationType>, res: Response) => {
  const body = req.body;
  const response = await login(body.email, body.password);
  res.status(200).json(response);
});
