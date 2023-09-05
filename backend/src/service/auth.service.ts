import { db } from "../schema/kysley-instance";
import { getRandomKey } from "../utils/helper/getRandomKey";
import { HttpError } from "../utils/helper/httpError";
import * as bcrypt from "bcrypt";
import uuid from "uuid";
import { minutesToMilliseconds } from "../utils/helper/miliseconds";

export async function login(email: string, password: string) {
  const user = await db.selectFrom("user").where("email", "=", email).select(["email", "password", "uuid"]).executeTakeFirst();

  if (!user) {
    throw new HttpError("Incorrect email or password", 404);
  }

  if (await bcrypt.compare(password, user.password)) {
    throw new HttpError("Incorrect email or password", 404);
  }

  const token = getRandomKey(32);

  // save token to database
  const loginToken = await db
    .insertInto("loginToken")
    .values({ token: token, user_uuid: user.uuid, uuid: uuid.v4(), expires_at: new Date(Date.now() + minutesToMilliseconds(2)) })
    .returningAll()
    .executeTakeFirst();

  if (!loginToken) {
    throw new HttpError("Error wile logging you in. Please try again later.", 404);
  }

  return {
    token: loginToken.token,
    expiresAt: loginToken.expires_at,
    email: user.email,
  };
}
