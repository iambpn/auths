import { desc, eq } from "drizzle-orm";
import { db } from "../schema/__mocks__/drizzle-migrate";
import { ForgotPasswordSchema, LoginTokenSchema, UserSchema } from "../schema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { HttpError } from "../utils/helper/httpError";
import { getLoginToken, initiateForgotPasswordFn, loginFn, resetPassword, signUpFn, validateUser } from "./auth.service";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid";
import { getRandomKey } from "../utils/helper/getRandomKey";
import { minutesToMilliseconds } from "../utils/helper/miliseconds";

//  mocking drizzle instance using manual mocking
jest.mock("../schema/drizzle-migrate");

const UserRole = "user";

describe("Integration Testing Auth service", () => {
  describe("Get Login Token", () => {
    it("should throw 404 error for invalid user error", async () => {
      const email = "abc@gmail.com";
      const password = "password123";

      try {
        await getLoginToken(email, password);
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(404);
      }
    });

    it("Should throw 404 error for incorrect password error", async () => {
      const email = "abc@gmail.com";
      const password = "password123";

      try {
        await db.insert(UserSchema).values({
          email,
          role: UserRole,
          password: await bcrypt.hash(password, config.hashRounds()),
          uuid: uuid.v4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await getLoginToken(email, "wrong password");
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(404);
      }
    });

    it("Should return a success object", async () => {
      const email = "abc@gmail.com";
      const password = "password123";

      await db.insert(UserSchema).values({
        email,
        role: UserRole,
        password: await bcrypt.hash(password, config.hashRounds()),
        uuid: uuid.v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const data = await getLoginToken(email, password);

      expect(data.email).toEqual(email);
      expect(data.expiresAt).toBeDefined();
      expect(data.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(data.token).toBeDefined();
    });

    it("Should invalidate the previous login token when issuing new token", async () => {
      const email = "abc@gmail.com";
      const password = "password123";

      const [user] = await db
        .insert(UserSchema)
        .values({
          email,
          role: UserRole,
          password: await bcrypt.hash(password, config.hashRounds()),
          uuid: uuid.v4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const data = await getLoginToken(email, password);

      expect(data.email).toEqual(email);
      expect(data.expiresAt).toBeDefined();
      expect(data.token).toBeDefined();

      const data2 = await getLoginToken(email, password);

      expect(data2.email).toEqual(email);
      expect(data.expiresAt).toBeDefined();
      expect(data.token).toBeDefined();

      expect(data2.token).not.toEqual(data.token);

      // select second last token
      const [loginToken] = await db.select().from(LoginTokenSchema).where(eq(LoginTokenSchema.userUuid, user.uuid)).orderBy(desc(LoginTokenSchema.createdAt)).limit(1).offset(1);

      expect(loginToken.expiresAt.getTime()).toBeLessThan(Date.now());
    });
  });

  describe("Sign up FN", () => {
    it("should throw 409 error for email already exists", async () => {
      const email = "abc@gmail.com";
      const password = "password123";

      const [user] = await db
        .insert(UserSchema)
        .values({
          email,
          role: UserRole,
          password: await bcrypt.hash(password, config.hashRounds()),
          uuid: uuid.v4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      try {
        await signUpFn(email, password, UserRole);
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(409);
      }
    });

    it("should create a new user", async () => {
      const email = "abc@gmail.com";
      const password = "password123";

      const user = await signUpFn(email, password, UserRole);

      const [sameUser] = await db.select().from(UserSchema).where(eq(UserSchema.email, email)).limit(1);

      expect(user.uuid).toEqual(sameUser.uuid);
      expect(user.role).toEqual(UserRole);
    });
  });

  describe("Login FN", () => {
    it("should throw 404 error on invalid login token", async () => {
      try {
        await db.insert(UserSchema).values({
          email: "abc@gmail.com",
          role: UserRole,
          password: "password123",
          uuid: uuid.v4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // login with invalid token
        await loginFn("wrong token", "abc@gmail.com", {});
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
        await loginFn("wrong token", "abc@gmail.com", {});
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(404);
      }
    });
    it("should return success object and disable login token after using it", async () => {
      const email = "abc@gmail.com";
      const password = "password";
      const [user] = await db
        .insert(UserSchema)
        .values({
          email,
          role: UserRole,
          password,
          uuid: uuid.v4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

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

      const loginParams = await loginFn(token, email, {});

      expect(loginParams.email).toEqual(email);
      expect(loginParams.uuid).toEqual(user.uuid);
      expect(loginParams.jwtToken).toBeDefined();

      const [expiredToken] = await db.select().from(LoginTokenSchema).where(eq(LoginTokenSchema.uuid, loginToken.uuid));

      expect(loginToken.token).toEqual(expiredToken.token);
      expect(expiredToken.expiresAt.getTime()).toBeLessThan(Date.now());
    });
  });

  describe("Validate User", () => {
    it("should throw 404 error on invalid email", async () => {
      const email = "abc@gmail.com";
      try {
        await validateUser(email);
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toEqual(404);
      }
    });
    it("should return user object on success", async () => {
      const email = "abc@gmail.com";
      const password = "password";
      await db.insert(UserSchema).values({
        email,
        role: UserRole,
        password: password,
        uuid: uuid.v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user = await validateUser(email);

      expect(user).toBeDefined();
      expect(user.email).toEqual(email);
    });
  });

  describe("Initiate forgot password FN", () => {
    it("should return 404 error on invalid email error", async () => {
      const email = "abc@gmail.com";
      try {
        await initiateForgotPasswordFn(email);
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(404);
      }
    });
    it("should expire previous token before on success and should return the success object", async () => {
      const email = "abc@gmail.com";
      const password = "password";

      // create user
      const [user] = await db
        .insert(UserSchema)
        .values({
          email,
          role: UserRole,
          password: password,
          uuid: uuid.v4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const forgotPasswordToken = await initiateForgotPasswordFn(email);

      const forgotPasswordToken2 = await initiateForgotPasswordFn(email);

      expect(forgotPasswordToken2.email).toBeDefined();
      expect(forgotPasswordToken2.expires_at).toBeDefined();
      expect(forgotPasswordToken2.token).toBeDefined();
      expect(forgotPasswordToken2.expires_at.getTime()).toBeGreaterThan(Date.now());

      const [prevToken] = await db.select().from(ForgotPasswordSchema).where(eq(ForgotPasswordSchema.userUuid, user.uuid)).orderBy(desc(ForgotPasswordSchema.createdAt)).limit(1).offset(1);

      expect(prevToken.token).toEqual(forgotPasswordToken.token);
      expect(prevToken.expiresAt.getTime()).toBeLessThan(Date.now());
    });
    it("should return returnToken as forget password token if it is passed", async () => {
      const email = "abc@gmail.com";
      const password = "password";
      const token = "fptoken";

      // create user
      const [user] = await db
        .insert(UserSchema)
        .values({
          email,
          role: UserRole,
          password: password,
          uuid: uuid.v4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const forgotPasswordToken = await initiateForgotPasswordFn(email, token);

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
        await resetPassword(token, email, "password");
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(404);
      }
    });

    it("should return 400 error on invalid token error", async () => {
      const email = "abc@gmail.com";
      const token = "token";

      try {
        await db.insert(UserSchema).values({
          email,
          role: UserRole,
          password: "password",
          uuid: uuid.v4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await resetPassword(token, email, "password");
      } catch (error: unknown) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toEqual(400);
      }
    });

    it("should update the user password and invalidate used token", async () => {
      const email = "abc@gmail.com";
      const token = "token";
      const password = "password";
      const newPassword = "new_password";

      const [user] = await db
        .insert(UserSchema)
        .values({
          email,
          role: UserRole,
          password,
          uuid: uuid.v4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      expect(user.password).toEqual(password);

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

      await resetPassword(token, email, newPassword);

      const [fpToken] = await db.select().from(ForgotPasswordSchema).where(eq(ForgotPasswordSchema.uuid, returnForgotPasswordToken.uuid)).limit(1);
      const [updatedUser] = await db.select().from(UserSchema).where(eq(UserSchema.uuid, user.uuid)).limit(1);

      expect(updatedUser.password).not.toEqual(password);

      expect(fpToken.token).toEqual(token);
      expect(fpToken.expiresAt.getTime()).toBeLessThan(Date.now());
    });
  });
});
