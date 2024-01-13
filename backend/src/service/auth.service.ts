import * as bcrypt from "bcrypt";
import { and, desc, eq, gte } from "drizzle-orm";
import * as jwt from "jsonwebtoken";
import * as uuid from "uuid";
import { db } from "../dbSchema/drizzle-migrate";
import { schema } from "../dbSchema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { getRandomKey } from "../utils/helper/getRandomKey";
import { HttpError } from "../utils/helper/httpError";
import { ENV_VARS } from "./env.service";
import { getRoleById, getRoleBySlug } from "./roles.service";

export async function getLoginToken(email: string, password: string) {
  const [user] = await db
    .select({
      email: schema.UserSchema.email,
      password: schema.UserSchema.password,
      uuid: schema.UserSchema.uuid,
    })
    .from(schema.UserSchema)
    .where(eq(schema.UserSchema.email, email))
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
    .from(schema.LoginTokenSchema)
    .where(and(eq(schema.LoginTokenSchema.userUuid, user.uuid), gte(schema.LoginTokenSchema.expiresAt, new Date())))
    .orderBy(desc(schema.LoginTokenSchema.createdAt))
    .limit(1);

  if (prevToken) {
    await db
      .update(schema.LoginTokenSchema)
      .set({ expiresAt: new Date(Date.now()) })
      .where(eq(schema.LoginTokenSchema.uuid, prevToken.uuid));
  }

  const token = getRandomKey(32);
  // save token to database
  await db.insert(schema.LoginTokenSchema).values({
    token: token,
    userUuid: user.uuid,
    uuid: uuid.v4(),
    expiresAt: new Date(Date.now() + config.loginTokenExpiration()),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [loginToken] = await db.select().from(schema.LoginTokenSchema).where(eq(schema.LoginTokenSchema.token, token)).limit(1);

  if (!loginToken) {
    throw new HttpError("Error while logging you in. Please try again later.", 404);
  }

  return {
    token: loginToken.token,
    expiresAt: loginToken.expiresAt,
    email: user.email,
  };
}

export async function signUpFn(email: string, password: string, roleSlug: string, others: Record<string, any> = {}) {
  const [user] = await db
    .select({
      email: schema.UserSchema.email,
    })
    .from(schema.UserSchema)
    .where(eq(schema.UserSchema.email, email))
    .limit(1);

  if (user) {
    throw new HttpError("Email already exists. Please use different email", 409);
  }

  const role = await getRoleBySlug(roleSlug);

  const hashedPassword = await bcrypt.hash(password, config.hashRounds());
  await db.insert(schema.UserSchema).values({
    email,
    password: hashedPassword,
    uuid: uuid.v4(),
    others: JSON.stringify(others),
    role: role.uuid,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [savedUser] = await db.select().from(schema.UserSchema).where(eq(schema.UserSchema.email, email)).limit(1);

  if (!savedUser) {
    throw new HttpError("Error while creating user. Please try again later", 404);
  }

  return {
    email: savedUser.email,
    uuid: savedUser.uuid,
    role: savedUser.role,
  };
}

export async function loginFn(token: string, email: string, additionalPayload: Record<string, any> = {}) {
  const [user] = await db
    .select({
      email: schema.UserSchema.email,
      password: schema.UserSchema.password,
      role: schema.UserSchema.role,
      uuid: schema.UserSchema.uuid,
    })
    .from(schema.UserSchema)
    .where(eq(schema.UserSchema.email, email))
    .limit(1);

  if (!user) {
    throw new HttpError("User not found.", 404);
  }

  const [loginToken] = await db
    .select()
    .from(schema.LoginTokenSchema)
    .where(
      and(
        eq(schema.LoginTokenSchema.token, token),
        eq(schema.LoginTokenSchema.userUuid, user.uuid),
        gte(schema.LoginTokenSchema.expiresAt, new Date())
      )
    )
    .limit(1)
    .orderBy(desc(schema.LoginTokenSchema.createdAt));

  if (!loginToken) {
    throw new HttpError("Invalid token", 404);
  }

  // get role
  const rolesPermission = await getRoleById(user.role);

  // encode email and additional payload to jwt token
  const payload = { ...user, ...additionalPayload, role: rolesPermission, password: undefined };
  const jwtToken = jwt.sign(payload, ENV_VARS.AUTHS_SECRET, { expiresIn: config.jwtTokenExpiration() });

  // disable login token
  await db
    .update(schema.LoginTokenSchema)
    .set({ expiresAt: new Date() })
    .where(and(eq(schema.LoginTokenSchema.token, token), eq(schema.LoginTokenSchema.userUuid, user.uuid)));

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
      uuid: schema.UserSchema.uuid,
      email: schema.UserSchema.email,
      others: schema.UserSchema.others,
      createdAt: schema.UserSchema.createdAt,
      updatedAt: schema.UserSchema.updatedAt,
    })
    .from(schema.UserSchema)
    .where(eq(schema.UserSchema.email, email))
    .limit(1);

  if (!user) {
    throw new HttpError("User not found", 404);
  }

  return user;
}

export async function initiateForgotPasswordFn(email: string, returnToken?: string) {
  let forgetPasswordToken = returnToken;
  if (!forgetPasswordToken) {
    forgetPasswordToken = getRandomKey(16);
  }

  const [user] = await db.select().from(schema.UserSchema).where(eq(schema.UserSchema.email, email)).limit(1);
  if (!user) {
    throw new HttpError("User with provided email not found", 404);
  }

  const [prevToken] = await db
    .select()
    .from(schema.ForgotPasswordSchema)
    .where(and(eq(schema.ForgotPasswordSchema.userUuid, user.uuid), gte(schema.ForgotPasswordSchema.expiresAt, new Date())))
    .orderBy(desc(schema.ForgotPasswordSchema.createdAt))
    .limit(1);
  if (prevToken) {
    await db.update(schema.ForgotPasswordSchema).set({ expiresAt: new Date() }).where(eq(schema.ForgotPasswordSchema.uuid, prevToken.uuid));
  }

  await db.insert(schema.ForgotPasswordSchema).values({
    uuid: uuid.v4(),
    userUuid: user.uuid,
    token: forgetPasswordToken,
    expiresAt: new Date(Date.now() + config.loginTokenExpiration()),
    createdAt: new Date(),
  });

  const [forgetPassword] = await db
    .select()
    .from(schema.ForgotPasswordSchema)
    .where(eq(schema.ForgotPasswordSchema.token, forgetPasswordToken))
    .limit(1);

  return {
    email,
    token: forgetPassword.token,
    expires_at: forgetPassword.expiresAt,
  };
}

export async function resetPassword(token: string, email: string, newPassword: string) {
  const [user] = await db.select().from(schema.UserSchema).where(eq(schema.UserSchema.email, email)).limit(1);

  if (!user) {
    throw new HttpError("User with provided email not found", 404);
  }

  const [forgotPassword] = await db
    .select()
    .from(schema.ForgotPasswordSchema)
    .where(
      and(
        eq(schema.ForgotPasswordSchema.token, token),
        eq(schema.ForgotPasswordSchema.userUuid, user.uuid),
        gte(schema.ForgotPasswordSchema.expiresAt, new Date())
      )
    )
    .orderBy(desc(schema.ForgotPasswordSchema.createdAt))
    .limit(1);

  if (!forgotPassword) {
    throw new HttpError("Invalid token", 400);
  }

  // invalidate token
  await db.update(schema.ForgotPasswordSchema).set({ expiresAt: new Date() }).where(eq(schema.ForgotPasswordSchema.uuid, forgotPassword.uuid));

  const newPasswordHash = await bcrypt.hash(newPassword, config.hashRounds());
  // update password
  await db.update(schema.UserSchema).set({ password: newPasswordHash }).where(eq(schema.UserSchema.uuid, user.uuid));

  return {
    message: "Password changed successfully",
  };
}
