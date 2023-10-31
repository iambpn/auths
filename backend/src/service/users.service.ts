import { db } from "../schema/drizzle-migrate";
import { UserSchema } from "../schema/drizzle-schema";
import { PaginationQuery } from "../utils/helper/parsePagination";

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

  return users;
}
