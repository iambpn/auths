import { eq, sql } from "drizzle-orm";
import { db } from "../dbSchema/drizzle-migrate";
import { schema } from "../dbSchema/drizzle-schema";
import { HttpError } from "../utils/helper/httpError";
import { PaginatedResponse, PaginationQuery } from "../utils/helper/parsePagination";
import { UpdateUserType } from "../utils/validation_schema/cms/updateUser.validation.schema";

export async function getAllUsers(paginationQuery: ReturnType<typeof PaginationQuery>) {
  const users = await db
    .select({
      uuid: schema.UserSchema.uuid,
      email: schema.UserSchema.email,
      others: schema.UserSchema.others,
      role: schema.UserSchema.role,
      createdAt: schema.UserSchema.createdAt,
      updatedAt: schema.UserSchema.updatedAt,
    })
    .from(schema.UserSchema)
    .limit(paginationQuery.limit)
    .offset(paginationQuery.skip);

  const usersResponse = await Promise.all(
    users.map(async (user) => {
      const [role] = await db.select().from(schema.RolesSchema).where(eq(schema.RolesSchema.uuid, user.role)).limit(1);
      return { ...user, role: role };
    })
  );

  const [count] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(schema.UserSchema);

  return { users: usersResponse, ...PaginatedResponse(count.count, paginationQuery) };
}

export async function getUserById(id: string) {
  const [user] = await db
    .select({
      uuid: schema.UserSchema.uuid,
      email: schema.UserSchema.email,
      others: schema.UserSchema.others,
      role: schema.UserSchema.role,
      createdAt: schema.UserSchema.createdAt,
      updatedAt: schema.UserSchema.updatedAt,
    })
    .from(schema.UserSchema)
    .where(eq(schema.UserSchema.uuid, id))
    .limit(1);

  if (!user) {
    throw new HttpError("User Not found", 404);
  }

  const [role] = await db.select().from(schema.RolesSchema).where(eq(schema.RolesSchema.uuid, user.role)).limit(1);
  return { ...user, role: role };
}

export async function updateUser(userData: UpdateUserType, id: string) {
  const [user] = await db.select().from(schema.UserSchema).where(eq(schema.UserSchema.uuid, id)).limit(1);

  if (!user) {
    throw new HttpError("User Not found", 404);
  }

  const [existingUser] = await db
    .select({ uuid: schema.UserSchema.uuid })
    .from(schema.UserSchema)
    .where(eq(schema.UserSchema.email, userData.email))
    .limit(1);

  if (existingUser && existingUser.uuid !== id) {
    throw new HttpError("User with this email already exists", 400);
  }

  const updateData = {
    ...userData,
    updatedAt: new Date(),
  };

  await db.update(schema.UserSchema).set(updateData).where(eq(schema.UserSchema.uuid, id));

  const updatedUser = await getUserById(user.uuid);
  return updatedUser;
}

export async function deleteUser(id: string) {
  const [user] = await db
    .select({
      email: schema.UserSchema.email,
      uuid: schema.UserSchema.uuid,
    })
    .from(schema.UserSchema)
    .where(eq(schema.UserSchema.uuid, id))
    .limit(1);

  if (!user) {
    throw new HttpError("User Not found", 404);
  }

  await db.delete(schema.UserSchema).where(eq(schema.UserSchema.uuid, id));

  return user;
}
