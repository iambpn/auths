import * as bcrypt from "bcrypt";
import { and, desc, eq, gte } from "drizzle-orm";
import * as jwt from "jsonwebtoken";
import * as uuid from "uuid";
import { db } from "../schema/drizzle-migrate";
import { ForgotPasswordSchema, LoginTokenSchema, UserSchema } from "../schema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { getRandomKey } from "../utils/helper/getRandomKey";
import { HttpError } from "../utils/helper/httpError";
import { minutesToMilliseconds } from "../utils/helper/miliseconds";
import { ENV_VARS } from "./env.service";

export async function getLoginToken(email: string, password: string) {
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

  // release previous token
  const [prevToken] = await db
    .select()
    .from(LoginTokenSchema)
    .where(and(eq(LoginTokenSchema.userUuid, user.uuid), gte(LoginTokenSchema.expiresAt, new Date())))
    .orderBy(desc(LoginTokenSchema.createdAt))
    .limit(1);

  if (prevToken) {
    await db
      .update(LoginTokenSchema)
      .set({ expiresAt: new Date(Date.now()) })
      .where(eq(LoginTokenSchema.uuid, prevToken.uuid));
  }

  const token = getRandomKey(32);
  // save token to database
  const [loginToken] = await db
    .insert(LoginTokenSchema)
    .values({
      token: token,
      userUuid: user.uuid,
      uuid: uuid.v4(),
      expiresAt: new Date(Date.now() + minutesToMilliseconds(+(ENV_VARS.AUTHS_TOKEN_EXPIRATION_TIME ?? 2))),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  if (!loginToken) {
    throw new HttpError("Error wile logging you in. Please try again later.", 404);
  }

  return {
    token: loginToken.token,
    expiresAt: loginToken.expiresAt,
    email: user.email,
  };
}

export async function signUpFn(email: string, password: string, others: Record<string, any> = {}) {
  const [user] = await db
    .select({
      email: UserSchema.email,
    })
    .from(UserSchema)
    .where(eq(UserSchema.email, email));

  if (user) {
    throw new HttpError("Email already exists. Please use different email", 409);
  }

  const hashedPassword = await bcrypt.hash(password, config.hashRounds);

  const [savedUser] = await db
    .insert(UserSchema)
    .values({ email, password: hashedPassword, uuid: uuid.v4(), others: JSON.stringify(others), createdAt: new Date(), updatedAt: new Date() })
    .returning();

  if (!savedUser) {
    throw new HttpError("Error while creating user. Please try again later", 404);
  }

  return {
    email: savedUser.email,
    uuid: savedUser.uuid,
  };
}

export async function loginFn(token: string, email: string, additionalPayload: Record<string, any> = {}) {
  const [user] = await db.select().from(UserSchema).where(eq(UserSchema.email, email)).limit(1);

  if (!user) {
    throw new HttpError("User not found.", 404);
  }

  const [loginToken] = await db
    .select()
    .from(LoginTokenSchema)
    .where(and(eq(LoginTokenSchema.token, token), eq(LoginTokenSchema.userUuid, user.uuid), gte(LoginTokenSchema.expiresAt, new Date())))
    .limit(1)
    .orderBy(desc(LoginTokenSchema.createdAt));

  if (!loginToken) {
    throw new HttpError("Invalid token", 404);
  }

  // encode email and additional payload to jwt token
  const jwtToken = jwt.sign({ email, ...additionalPayload }, ENV_VARS.AUTHS_SECRET, { expiresIn: ENV_VARS.AUTHS_JWT_EXPIRATION_TIME ?? minutesToMilliseconds(60 * 24) });

  // disable login token
  await db
    .update(LoginTokenSchema)
    .set({ expiresAt: new Date() })
    .where(and(eq(LoginTokenSchema.token, token), eq(LoginTokenSchema.userUuid, user.uuid)));

  return {
    email: user.email,
    uuid: user.uuid,
    jwtToken,
  };
}

/**
 *
 * @param email
 * @returns
 * @throws {HttpError} User not found
 *
 */
export async function validateUser(email: string) {
  const [user] = await db
    .select({
      uuid: UserSchema.uuid,
      email: UserSchema.email,
      others: UserSchema.others,
      createdAt: UserSchema.createdAt,
      updatedAt: UserSchema.updatedAt,
    })
    .from(UserSchema)
    .where(eq(UserSchema.email, email))
    .limit(1);

  if (!user) {
    throw new HttpError("User not found", 404);
  }

  return user;
}

export async function initiateForgotPasswordFn(email: string, token?: string) {
  let forgetPasswordToken = token;
  if (!forgetPasswordToken) {
    forgetPasswordToken = getRandomKey(16);
  }

  const [user] = await db.select().from(UserSchema).where(eq(UserSchema.email, email)).limit(1);
  if (!user) {
    throw new HttpError("User with provided email not found", 404);
  }

  const [prevToken] = await db
    .select()
    .from(ForgotPasswordSchema)
    .where(and(eq(ForgotPasswordSchema.userUuid, user.uuid), gte(ForgotPasswordSchema.expiresAt, new Date())))
    .orderBy(desc(ForgotPasswordSchema.createdAt))
    .limit(1);
  if (prevToken) {
    await db.update(ForgotPasswordSchema).set({ expiresAt: new Date() }).where(eq(ForgotPasswordSchema.uuid, prevToken.uuid));
  }

  const [forgetPassword] = await db
    .insert(ForgotPasswordSchema)
    .values({
      uuid: uuid.v4(),
      userUuid: user.uuid,
      token: forgetPasswordToken,
      expiresAt: new Date(Date.now() + minutesToMilliseconds(+(ENV_VARS.AUTHS_TOKEN_EXPIRATION_TIME ?? 2))),
      createdAt: new Date(),
    })
    .returning();

  return {
    email,
    token: forgetPassword.token,
    expires_at: forgetPassword.expiresAt,
  };
}

export async function resetPassword(token: string, email: string, newPassword: string) {
  const [user] = await db.select().from(UserSchema).where(eq(UserSchema.email, email)).limit(1);

  if (!user) {
    throw new HttpError("User with provided email not found", 404);
  }

  const [forgotPassword] = await db
    .select()
    .from(ForgotPasswordSchema)
    .where(and(eq(ForgotPasswordSchema.token, token), eq(ForgotPasswordSchema.userUuid, user.uuid), gte(ForgotPasswordSchema.expiresAt, new Date())))
    .orderBy(desc(ForgotPasswordSchema.createdAt))
    .limit(1);

  if (!forgotPassword) {
    throw new HttpError("Invalid token", 400);
  }

  const newPasswordHash = await bcrypt.hash(newPassword, config.hashRounds);
  // update password
  await db.update(UserSchema).set({ password: newPasswordHash }).where(eq(UserSchema.uuid, user.uuid));

  // invalidate token
  await db.update(ForgotPasswordSchema).set({ expiresAt: new Date() }).where(eq(ForgotPasswordSchema.uuid, forgotPassword.uuid));

  return {
    message: "Password changed successfully",
  };
}
