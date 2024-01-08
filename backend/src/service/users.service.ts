import { eq, sql } from "drizzle-orm";
import { db } from "../schema/drizzle-migrate";
import { RolesSchema, UserSchema } from "../schema/drizzle-schema";
import { HttpError } from "../utils/helper/httpError";
import { PaginatedResponse, PaginationQuery } from "../utils/helper/parsePagination";

export async function getAllUsers(paginationQuery: ReturnType<typeof PaginationQuery>) {
  const users = await db
    .select({
      uuid: UserSchema.uuid,
      email: UserSchema.email,
      others: UserSchema.others,
      role: UserSchema.role,
      createdAt: UserSchema.createdAt,
      updatedAt: UserSchema.updatedAt,
    })
    .from(UserSchema)
    .limit(paginationQuery.limit)
    .offset(paginationQuery.skip);

  const usersResponse = await Promise.all(
    users.map(async (user) => {
      const [role] = await db.select().from(RolesSchema).where(eq(RolesSchema.uuid, user.role)).limit(1);
      return { ...user, role: role };
    })
  );

  const [count] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(UserSchema);

  return { users: usersResponse, ...PaginatedResponse(count.count, paginationQuery) };
}

export async function deleteUser(id: string) {
  const user = await db
    .select({
      email: UserSchema.email,
      uuid: UserSchema.uuid,
    })
    .from(UserSchema)
    .where(eq(UserSchema.uuid, id))
    .limit(1);

  if (!user) {
    throw new HttpError("User Not found", 404);
  }

  await db.delete(UserSchema).where(eq(UserSchema.uuid, id));

  return user;
}
