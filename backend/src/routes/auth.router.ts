import { Request, Response, Router } from "express";
import { validate } from "../utils/helper/validate";
import { LoginValidationSchema, LoginValidationType } from "../utils/validation_schema/login.schema";
import { db } from "../schema/kysley-instance";
import { HttpError } from "../utils/helper/httpError";

export const router = Router();

router.post("/", validate(LoginValidationSchema), async (req: Request<any, any, LoginValidationType>, res: Response) => {
  const body = req.body;
  const users = await db.selectFrom("user").where("email", "=", body.email).select(["email", "password"]).executeTakeFirst();

  if (!users) {
    throw new HttpError("Incorrect email or password", 404);
  }

  // todo: hash the password before querying
  if (users.password !== body.password) {
    throw new HttpError("Incorrect email or password", 404);
  }

  // todo return a temp token
});
