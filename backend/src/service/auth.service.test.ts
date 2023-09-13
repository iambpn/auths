import { desc, eq } from "drizzle-orm";
import { db } from "../schema/__mocks__/drizzle-migrate";
import { LoginTokenSchema, UserSchema } from "../schema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { HttpError } from "../utils/helper/httpError";
import { getLoginToken, signUpFn } from "./auth.service";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid";

//  mocking drizzle instance using manual mocking
jest.mock("../schema/drizzle-migrate");

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
          password: await bcrypt.hash(password, config.hashRounds),
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
        password: await bcrypt.hash(password, config.hashRounds),
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
          password: await bcrypt.hash(password, config.hashRounds),
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
          password: await bcrypt.hash(password, config.hashRounds),
          uuid: uuid.v4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      try {
        await signUpFn(email, password);
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

      const user = await signUpFn(email, password);

      const [sameUser] = await db.select().from(UserSchema).where(eq(UserSchema.email, email)).limit(1);

      expect(user.uuid).toEqual(sameUser.uuid);
    });
  });

  describe("Login FN", () => {
    it.todo("should throw 404 error on invalid login token");
    it.todo("should throw 404 error on invalid email");
    it.todo("should disable login token after using it");
    it.todo("should return success object on success");
  });

  describe("Validate User", () => {
    it.todo("should throw 404 error on invalid email");
    it.todo("should return user object on success");
  });

  describe("Initiate forgot password FN", () => {});

  describe("Reset password", () => {});
});
