import { db } from "../schema/drizzle-migrate";
import { getRandomKey } from "../utils/helper/getRandomKey";
import { HttpError } from "../utils/helper/httpError";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid";
import { minutesToMilliseconds } from "../utils/helper/miliseconds";
import { LoginTokenSchema, UserSchema } from "../schema/drizzle-schema";
import { and, desc, eq } from "drizzle-orm";
import * as jwt from "jsonwebtoken";
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
  const [prevToken] = await db.select().from(LoginTokenSchema).where(eq(LoginTokenSchema.userUuid, user.uuid)).orderBy(desc(LoginTokenSchema.createdAt)).limit(1);

  if (prevToken) {
    await db
      .update(LoginTokenSchema)
      .set({ expiresAt: new Date(Date.now()) })
      .where(eq(LoginTokenSchema.userUuid, prevToken.uuid));
  }

  const token = getRandomKey(32);
  // save token to database
  const [loginToken] = await db
    .insert(LoginTokenSchema)
    .values({
      token: token,
      userUuid: user.uuid,
      uuid: uuid.v4(),
      expiresAt: new Date(Date.now() + minutesToMilliseconds(2)),
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
    throw new HttpError("Email already exists. Please use different email", 404);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [savedUser] = await db
    .insert(UserSchema)
    .values({ email, password: hashedPassword, uuid: uuid.v4(), others: JSON.stringify(others) })
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

  const [loginToken] = await db
    .select()
    .from(LoginTokenSchema)
    .where(and(eq(LoginTokenSchema.token, token), eq(LoginTokenSchema.userUuid, user.uuid)))
    .limit(1)
    .orderBy(desc(LoginTokenSchema.createdAt));

  if (!loginToken) {
    throw new HttpError("Invalid token", 404);
  }

  // encode email and additional payload to jwt token
  const jwtToken = jwt.sign({ email, ...additionalPayload }, ENV_VARS.AUTHS_SECRET, { expiresIn: ENV_VARS.AUTHS_JWT_EXPIRATION_TIME ?? minutesToMilliseconds(60 * 24) });

  return {
    email: user.email,
    uuid: user.uuid,
    jwtToken,
  };
}
