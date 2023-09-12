import { db } from "../schema/__mocks__/drizzle-migrate";
import { UserSchema } from "../schema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { HttpError } from "../utils/helper/httpError";
import { getLoginToken } from "./auth.service";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid";

jest.mock("../schema/drizzle-migrate");

describe("Testing Auth service", () => {
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
    });
    const data = await getLoginToken(email, password);

    expect(data.email).toEqual(email);
    expect(data.expiresAt).toBeDefined();
    expect(data.token).toBeDefined();
  });
});
