import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import * as uuid from "uuid";
import { db } from "../dbSchema/__mocks__/drizzle-migrate";
import { schema } from "../dbSchema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { HttpError } from "../utils/helper/httpError";
import { deleteUser, getAllUsers, getUserById, updateUser } from "./users.service";

//  mocking drizzle instance using manual mocking
jest.mock("../dbSchema/drizzle-migrate");

const UserRole = { uuid: uuid.v4(), slug: "test_role" };
const Email = "abc@gmail.com";
const Password = "password123";

async function hashPassword(password: string) {
  return await bcrypt.hash(password, config.hashRounds());
}

async function insertUser(email: string, password: string, roleId?: string) {
  await db.insert(schema.UserSchema).values({
    email,
    role: roleId ?? uuid.v4(),
    password: await hashPassword(password),
    uuid: uuid.v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const user = await db.select().from(schema.UserSchema).where(eq(schema.UserSchema.email, email)).limit(1);

  return user[0];
}

async function insertRole(role: typeof UserRole) {
  await db.insert(schema.RolesSchema).values({
    name: role.slug,
    slug: role.slug,
    uuid: role.uuid,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("Users Service Testing", () => {
  describe("Get All Users", () => {
    it("Should return all users following pagination query", async () => {
      const user1 = await insertUser("abc@gmail.com", "password123");
      const user2 = await insertUser("abc1@gmail.com", "password123");
      const user3 = await insertUser("abc2@gmail.com", "password123");

      const users = await getAllUsers({ limit: 2, skip: 1 });

      expect(users.users.length).toBe(2);
      expect(users.users[0].email).toBe(user2.email);
      expect(users.users[1].email).toBe(user3.email);
    });
  });

  describe("Get User By Id", () => {
    it("Should return user by id", async () => {
      const user = await insertUser("abc@gmail.com", "password123");

      const userById = await getUserById(user.uuid);

      expect(userById.email).toBe(user.email);
    });

    it("Should return 404 error on user not found", async () => {
      try {
        expect(await getUserById(uuid.v4())).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(404);
      }
    });
  });

  describe("Update User Details", () => {
    it("Should throw 404 error on User Not Found", async () => {
      try {
        expect(await updateUser({ email: "abc@gmail.com", role: uuid.v4() }, uuid.v4())).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(404);
      }
    });

    it("Should throw 400 error if email is already taken", async () => {
      await insertRole(UserRole);

      const defaultUser = await insertUser(Email, Password, UserRole.uuid);
      const newUser = await insertUser("abc1@gmail.com", "password123", UserRole.uuid);

      try {
        expect(await updateUser({ email: "abc1@gmail.com", role: UserRole.uuid }, defaultUser.uuid)).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(400);
      }
    });

    it("Should update user email and role", async () => {
      await insertRole(UserRole);

      const newRole = { uuid: uuid.v4(), slug: "new_role" };
      await insertRole({
        slug: newRole.slug,
        uuid: newRole.uuid,
      });

      const defaultUser = await insertUser(Email, Password, UserRole.uuid);

      const updatedUser = await updateUser({ email: "abc@gmail.com", role: newRole.uuid }, defaultUser.uuid);

      expect(updatedUser.email).toBe("abc@gmail.com");
      expect(updatedUser.role.slug).toBe(newRole.slug);
    });
  });

  describe("Delete User", () => {
    it("Should throw 404 error on User not found", async () => {
      try {
        expect(await deleteUser(uuid.v4())).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(404);
      }
    });

    it("Should delete user", async () => {
      const user = await insertUser(Email, Password);

      await deleteUser(user.uuid);

      const [emptyUser] = await db.select().from(schema.UserSchema).where(eq(schema.UserSchema.email, user.email));

      expect(emptyUser).toBeUndefined();
    });
  });
});
