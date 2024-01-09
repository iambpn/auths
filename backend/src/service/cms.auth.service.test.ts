import * as bcrypt from "bcrypt";
import * as uuid from "uuid";
import { db } from "../schema/__mocks__/drizzle-migrate";
import { RolesSchema, UserSchema } from "../schema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { eq } from "drizzle-orm";
import { loginService } from "./cms.auth.service";
import * as jwt from "jsonwebtoken";
import { HttpError } from "../utils/helper/httpError";

//  mocking drizzle instance using manual mocking
jest.mock("../schema/drizzle-migrate");

const UserRole = { uuid: uuid.v4(), slug: "test_role" };
const Email = "abc@gmail.com";
const Password = "password123";

async function hashPassword(password: string) {
  return await bcrypt.hash(password, config.hashRounds());
}

async function insertUser(email: string, password: string, roleId?: string) {
  await db.insert(UserSchema).values({
    email,
    role: roleId ?? uuid.v4(),
    password: await hashPassword(password),
    uuid: uuid.v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const user = await db.select().from(UserSchema).where(eq(UserSchema.email, email)).limit(1);

  return user[0];
}

async function insertRole(role: typeof UserRole) {
  await db.insert(RolesSchema).values({
    name: role.slug,
    slug: role.slug,
    uuid: role.uuid,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("CMS Auth Service Testing", () => {
  describe("Login service", () => {
    it("Should issue a jwt login on correct email and password.", async () => {
      const superAdminUuid = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminUuid,
      });
      await insertUser(Email, Password, superAdminUuid);

      const loginData = await loginService(Email, Password);

      expect(loginData).toBeDefined();

      const payload = jwt.decode(loginData.jwtToken) as Record<string, any>;
      expect(payload.email).toBe(Email);
      expect(payload.role.slug).toBe(config.superAdminSlug);
    });

    it("Should throw 404 if user is not found", async () => {
      try {
        expect(await loginService(Email, Password)).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(404);
      }
    });

    it("Should throw 401 error on insufficient role", async () => {
      await insertRole({
        slug: config.superAdminSlug,
        uuid: uuid.v4(),
      });
      await insertUser(Email, Password);

      try {
        expect(await loginService(Email, Password)).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(401);
      }
    });

    it("Should throw 400 error on incorrect password", async () => {
      const SuperAdminUuid = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: SuperAdminUuid,
      });
      await insertUser(Email, Password, SuperAdminUuid);

      try {
        expect(await loginService(Email, "Password")).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(400);
      }
    });
  });

  describe("Validate Email", () => {
    it("Should throw 404 error on incorrect email", () => {});

    it("Should throw 400 error on missing security question", () => {});

    it("Should return success object on success", () => {});
  });

  describe("Forget Password Service", () => {
    it("Should throw 404 error on incorrect email", () => {});

    it("Should throw 400 error on security question not found", () => {});

    it("Should throw 400 error on invalid security question", () => {});

    it("Should throw 400 error on invalid security question", () => {});

    it("Should disable previous token when issuing new token", () => {});

    it("Should return token on success", () => {});
  });

  describe("Reset Password", () => {
    it("Should throw 400 error on invalid token", () => {});

    it("Should throw 404 error on token user not found", () => {});

    it("Should expire token once it is used", () => {});

    it("Should reset password on success", () => {});
  });

  describe("Set Security Question", () => {
    it("Should throw 404 error on user not found", () => {});

    it("Should 409 error on security question already added", () => {});

    it("Should add security questions", () => {});
  });

  describe("Update Security Question", () => {
    it("Should throw 404 error on user not found", () => {});

    it("Should throw 400 error on incorrect current password", () => {});

    it("Should update security question on success", () => {});
  });

  describe("Update Password", () => {
    it("Should throw 404 error on user not found", () => {});

    it("Should throw 400 error on incorrect current password", () => {});

    it("Should update passowrd on success", () => {});
  });
});
