import { desc, eq } from "drizzle-orm";
import { db } from "../schema/__mocks__/drizzle-migrate";
import { ForgotPasswordSchema, LoginTokenSchema, RolesSchema, UserSchema } from "../schema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { HttpError } from "../utils/helper/httpError";
import { getLoginToken, initiateForgotPasswordFn, loginFn, resetPassword, signUpFn, validateUser } from "./auth.service";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid";
import { getRandomKey } from "../utils/helper/getRandomKey";
import { minutesToMilliseconds } from "../utils/helper/miliseconds";
import * as jwt from "jsonwebtoken";

//  mocking drizzle instance using manual mocking
jest.mock("../schema/drizzle-migrate");

const UserRole = { uuid: uuid.v4(), slug: "test_role" };
const Email = "abc@gmail.com";
const Password = "password123";

async function hashPassword(password: string) {
  return await bcrypt.hash(password, config.hashRounds());
}

async function insertUser(email: string, password: string) {
  await db.insert(UserSchema).values({
    email,
    role: UserRole.uuid,
    password: await hashPassword(password),
    uuid: uuid.v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const user = await db.select().from(UserSchema).where(eq(UserSchema.email, email)).limit(1);

  return user[0];
}

async function insertRole() {
  await db.insert(RolesSchema).values({
    name: UserRole.slug,
    slug: UserRole.slug,
    uuid: UserRole.uuid,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("Integration Testing Auth service", () => {
  describe("Get Login Token", () => {
    it("should throw 404 error for invalid user error", async () => {
      try {
        expect(await getLoginToken(Email, Password)).toThrowError();
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(404);
      }
    });

    it("Should throw 404 error for incorrect password error", async () => {
      await insertUser(Email, Password);
      try {
        expect(await getLoginToken(Email, "wrong password")).toThrowError();
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(404);
      }
    });

    it("Should return a success object", async () => {
      await insertUser(Email, Password);
      const data = await getLoginToken(Email, Password);

      expect(data.email).toEqual(Email);
      expect(data.expiresAt).toBeDefined();
      expect(data.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(data.token).toBeDefined();
    });

    it("Should invalidate the previous login token when issuing new token", async () => {
      const user = await insertUser(Email, Password);
      const data = await getLoginToken(Email, Password);

      expect(data.email).toEqual(Email);
      expect(data.expiresAt).toBeDefined();
      expect(data.token).toBeDefined();

      const data2 = await getLoginToken(Email, Password);

      expect(data2.email).toEqual(Email);
      expect(data.expiresAt).toBeDefined();
      expect(data.token).toBeDefined();

      expect(data2.token).not.toEqual(data.token);

      // select second last token
      const [loginToken] = await db
        .select()
        .from(LoginTokenSchema)
        .where(eq(LoginTokenSchema.userUuid, user.uuid))
        .orderBy(desc(LoginTokenSchema.createdAt))
        .limit(1)
        .offset(1);

      expect(loginToken.expiresAt.getTime()).toBeLessThan(Date.now());
    });
  });

  describe("Sign up FN", () => {
    it("should throw 409 error for email already exists", async () => {
      await insertUser(Email, Password);

      try {
        expect(await signUpFn(Email, Password, UserRole.slug)).toThrowError();
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(409);
      }
    });

    it("Should create a new user", async () => {
      await insertRole();
      const user = await signUpFn(Email, Password, UserRole.slug);

      const [sameUser] = await db.select().from(UserSchema).where(eq(UserSchema.email, Email)).limit(1);

      expect(user.uuid).toEqual(sameUser.uuid);
      expect(user.role).toEqual(UserRole.uuid);
    });

    it("Should throw 404 error on Role not found", async () => {
      try {
        expect(await signUpFn(Email, Password, UserRole.slug)).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(404);
      }
    });
  });

  describe("Login FN", () => {
    it("should throw 404 error on invalid login token", async () => {
      await insertUser(Email, Password);
      try {
        // login with invalid token
        expect(await loginFn("wrong token", "abc@gmail.com", {})).toThrowError();
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(404);
      }
    });

    it("should throw 404 error on invalid email", async () => {
      try {
        // login with invalid token and invalid email
        expect(await loginFn("wrong token", "abc@gmail.com", {})).toThrowError();
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(404);
      }
    });

    it("should return success object and disable login token after using it", async () => {
      await insertRole();
      const user = await insertUser(Email, Password);

      const token = getRandomKey(64);
      const [loginToken] = await db
        .insert(LoginTokenSchema)
        .values({
          uuid: uuid.v4(),
          userUuid: user.uuid,
          token,
          expiresAt: new Date(Date.now() + minutesToMilliseconds(5)),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const loginParams = await loginFn(token, Email, {});

      expect(loginParams.email).toEqual(Email);
      expect(loginParams.uuid).toEqual(user.uuid);
      expect(loginParams.jwtToken).toBeDefined();

      const [expiredToken] = await db.select().from(LoginTokenSchema).where(eq(LoginTokenSchema.uuid, loginToken.uuid));

      expect(loginToken.token).toEqual(expiredToken.token);
      expect(expiredToken.expiresAt.getTime()).toBeLessThan(Date.now());
    });

    it("should include additional payload to the jtw token", async () => {
      await insertRole();
      const user = await insertUser(Email, Password);

      const token = getRandomKey(64);
      await db
        .insert(LoginTokenSchema)
        .values({
          uuid: uuid.v4(),
          userUuid: user.uuid,
          token,
          expiresAt: new Date(Date.now() + minutesToMilliseconds(5)),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const loginParams = await loginFn(token, Email, { data: "data" });

      expect(loginParams.email).toEqual(Email);
      expect(loginParams.uuid).toEqual(user.uuid);
      expect(loginParams.jwtToken).toBeDefined();

      const payload = jwt.decode(loginParams.jwtToken) as Record<string, any>;
      expect(payload.data).toEqual("data");
    });
  });

  describe("Validate User", () => {
    it("should throw 404 error on invalid email", async () => {
      const email = "abc@gmail.com";
      try {
        expect(await validateUser(email)).toThrowError();
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toEqual(404);
      }
    });

    it("should return user object on success", async () => {
      await insertUser(Email, Password);

      const user = await validateUser(Email);

      expect(user).toBeDefined();
      expect(user.email).toEqual(Email);
    });
  });

  describe("Initiate forgot password FN", () => {
    it("should return 404 error on invalid email error", async () => {
      const email = "abc@gmail.com";
      try {
        expect(await initiateForgotPasswordFn(email)).toThrowError();
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(404);
      }
    });

    it("should invalidate previous token before assigning new one", async () => {
      const user = await insertUser(Email, Password);

      const forgotPasswordToken = await initiateForgotPasswordFn(Email);

      const forgotPasswordToken2 = await initiateForgotPasswordFn(Email);

      expect(forgotPasswordToken2.email).toBeDefined();
      expect(forgotPasswordToken2.expires_at).toBeDefined();
      expect(forgotPasswordToken2.token).toBeDefined();
      expect(forgotPasswordToken2.expires_at.getTime()).toBeGreaterThan(Date.now());

      const [prevToken] = await db
        .select()
        .from(ForgotPasswordSchema)
        .where(eq(ForgotPasswordSchema.userUuid, user.uuid))
        .orderBy(desc(ForgotPasswordSchema.createdAt))
        .limit(1)
        .offset(1);

      expect(prevToken.token).toEqual(forgotPasswordToken.token);
      expect(prevToken.expiresAt.getTime()).toBeLessThan(Date.now());
    });

    it("should return 'returnToken' as forget password token", async () => {
      const token = "fptoken";

      // create user
      await insertUser(Email, Password);

      const forgotPasswordToken = await initiateForgotPasswordFn(Email, token);
      expect(forgotPasswordToken.token).toEqual(token);

      const [forgetPasswordToken2] = await db.select().from(ForgotPasswordSchema).where(eq(ForgotPasswordSchema.token, token)).limit(1);
      expect(forgotPasswordToken.token).toEqual(forgetPasswordToken2.token);
    });
  });

  describe("Reset password", () => {
    it("should return 404 error on invalid email error", async () => {
      const email = "abc@gmail.com";
      const token = "token";

      try {
        expect(await resetPassword(token, email, "password")).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(404);
      }
    });

    it("should return 400 error on invalid token error", async () => {
      const token = "token";

      await insertUser(Email, Password);
      try {
        expect(await resetPassword(token, Email, "password")).toThrowError();
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toEqual(400);
      }
    });

    it("should update the user password and invalidate used token", async () => {
      const token = "token";
      const newPassword = "new_password";

      const user = await insertUser(Email, Password);

      expect(await bcrypt.compare(Password, user.password)).toEqual(true);

      const [returnForgotPasswordToken] = await db
        .insert(ForgotPasswordSchema)
        .values({
          userUuid: user.uuid,
          token,
          uuid: uuid.v4(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 5),
          createdAt: new Date(),
        })
        .returning();

      await resetPassword(token, Email, newPassword);

      const [fpToken] = await db.select().from(ForgotPasswordSchema).where(eq(ForgotPasswordSchema.uuid, returnForgotPasswordToken.uuid)).limit(1);
      const [updatedUser] = await db.select().from(UserSchema).where(eq(UserSchema.uuid, user.uuid)).limit(1);

      expect(await bcrypt.compare(Password, updatedUser.password)).toEqual(false);

      expect(fpToken.token).toEqual(token);
      expect(fpToken.expiresAt.getTime()).toBeLessThan(Date.now());
    });
  });
});
