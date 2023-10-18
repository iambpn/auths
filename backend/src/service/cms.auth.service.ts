import bcrypt from "bcrypt";
import { db } from "../schema/drizzle-migrate";
import { UserSchema } from "../schema/drizzle-schema";
import { eq } from "drizzle-orm";
import { HttpError } from "../utils/helper/httpError";

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

  if (!(await bcrypt.compare(password, user.password))) {
    throw new HttpError("Incorrect email or password", 404);
  }

  //TODO: implement jwt token
}
