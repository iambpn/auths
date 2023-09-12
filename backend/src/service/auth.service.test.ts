import { desc, eq } from "drizzle-orm";
import { db } from "../schema/__mocks__/drizzle-migrate";
import { LoginTokenSchema, UserSchema } from "../schema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { HttpError } from "../utils/helper/httpError";
import { getLoginToken } from "./auth.service";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid";

jest.mock("../schema/drizzle-migrate");

describe("Testing Auth service", () => {
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
        db.insert(UserSchema).values({
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
    it.todo("should throw 409 error for user already exists");
    it.todo("should save the user");
  });
});
