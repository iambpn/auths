import bcrypt from "bcrypt";
import { db } from "../schema/drizzle-migrate";
import { SecurityQuestionSchema, UserSchema } from "../schema/drizzle-schema";
import { eq } from "drizzle-orm";
import { HttpError } from "../utils/helper/httpError";
import jwt from "jsonwebtoken";
import { ENV_VARS } from "./env.service";
import { minutesToMilliseconds } from "../utils/helper/miliseconds";
import { ForgotPasswordType } from "../utils/validation_schema/cms/forgotPassword.validation.schema";

export async function loginService(email: string, password: string) {
  const [user] = await db
    .select({
      email: UserSchema.email,
      password: UserSchema.password,
      uuid: UserSchema.uuid,
    })
    .from(UserSchema)
    .where(eq(UserSchema.email, email))
    .limit(1);

  if (!user) {
    throw new HttpError("Incorrect email or password", 404);
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new HttpError("Incorrect email or password", 404);
  }

  // encode email and additional payload to jwt token
  const jwtToken = jwt.sign({ ...user }, ENV_VARS.AUTHS_SECRET, { expiresIn: ENV_VARS.AUTHS_JWT_EXPIRATION_TIME ?? minutesToMilliseconds(60 * 24) });

  return {
    uuid: user.uuid,
    jwtToken,
  };
}

export async function forgotPasswordService(data: ForgotPasswordType) {
  const [user] = await db
    .select({
      email: UserSchema.email,
      password: UserSchema.password,
      uuid: UserSchema.uuid,
    })
    .from(UserSchema)
    .where(eq(UserSchema.email, data.email))
    .limit(1);

  if (!user) {
    throw new HttpError("Incorrect email or password", 404);
  }

  const [securityQuestion] = await db.select().from(SecurityQuestionSchema).where(eq(SecurityQuestionSchema.userUuid, user.uuid)).limit(1);

  if (
    !(await bcrypt.compare(data.answer1, securityQuestion.answer1)) ||
    !(await bcrypt.compare(data.answer2, securityQuestion.answer2))
  ) {
    throw new HttpError("Invalid Security Question or Answer", 404);
  }

}
