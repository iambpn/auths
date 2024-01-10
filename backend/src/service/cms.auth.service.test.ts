import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import * as jwt from "jsonwebtoken";
import * as uuid from "uuid";
import { db } from "../schema/__mocks__/drizzle-migrate";
import {
  ResetPasswordTokenSchema,
  RolesSchema,
  SecurityQuestionSchema,
  UserSchema
} from "../schema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { HttpError } from "../utils/helper/httpError";
import {
  forgotPasswordService,
  loginService,
  resetPassword,
  setInitialSecurityQuestion,
  updatePassword,
  updateSecurityQuestion,
  validateSuperadminEmail,
} from "./cms.auth.service";

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

  describe("Validate Forget Password Email", () => {
    it("Should throw 404 error on incorrect email", async () => {
      const data = {
        email: Email,
      };

      try {
        expect(await validateSuperadminEmail(data)).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(404);
      }
    });

    it("Should throw 400 error on missing security question", async () => {
      const superAdminId = uuid.v4();
      await insertRole({ slug: config.superAdminSlug, uuid: superAdminId });
      await insertUser(Email, Password, superAdminId);

      try {
        expect(await validateSuperadminEmail({ email: Email })).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(400);
      }
    });

    it("Should throw 401 error if role is insufficient", async () => {
      await insertUser(Email, Password);
      await insertRole({
        slug: config.superAdminSlug,
        uuid: uuid.v4(),
      });

      try {
        expect(await validateSuperadminEmail({ email: Email })).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(401);
      }
    });

    it("Should return success object on success", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });
      const user = await insertUser(Email, Password, superAdminId);

      await setInitialSecurityQuestion(
        {
          question1: 1,
          answer1: "name",
          question2: 1,
          answer2: "name",
        },
        {
          uuid: user.uuid,
        } as any
      );

      const result = await validateSuperadminEmail({ email: Email });
      expect(result).toBeDefined();
      expect(result.email).toEqual(Email);
    });
  });

  describe("Forget Password Service", () => {
    it("Should throw 404 error on incorrect email", async () => {
      try {
        expect(await forgotPasswordService({ email: "incorrect@email.com", answer1: "", answer2: "" })).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(404);
      }
    });

    it("Should throw 401 error on role miss-match", async () => {
      await insertRole({
        slug: config.superAdminSlug,
        uuid: uuid.v4(),
      });

      await insertUser(Email, Password);
      try {
        expect(await forgotPasswordService({ email: Email, answer1: "", answer2: "" })).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(401);
      }
    });

    it("Should throw 400 error on security question not found", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });
      await insertUser(Email, Password, superAdminId);

      try {
        expect(await forgotPasswordService({ email: "incorrect@email.com", answer1: "", answer2: "" })).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(404);
      }
    });

    it("Should throw 400 error on invalid security question answer", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });
      const user = await insertUser(Email, Password, superAdminId);

      await setInitialSecurityQuestion(
        {
          question1: 1,
          answer1: "name",
          question2: 1,
          answer2: "name",
        },
        {
          uuid: user.uuid,
        } as any
      );

      try {
        expect(await forgotPasswordService({ email: Email, answer1: "", answer2: "" })).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(400);
      }
    });

    it("Should disable previous token when issuing new token", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });
      const user = await insertUser(Email, Password, superAdminId);

      await setInitialSecurityQuestion(
        {
          question1: 1,
          answer1: "name",
          question2: 1,
          answer2: "name",
        },
        {
          uuid: user.uuid,
        } as any
      );

      const token = await forgotPasswordService({ email: Email, answer1: "name", answer2: "name" });

      const lastResetPasswordToken = await db.select().from(ResetPasswordTokenSchema).where(eq(ResetPasswordTokenSchema.token, token.token));

      expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(token.expiresAt).toEqual(lastResetPasswordToken[0].expiresAt);

      const token2 = await forgotPasswordService({ email: Email, answer1: "name", answer2: "name" });
      const previousResetPasswordToken = await db.select().from(ResetPasswordTokenSchema).where(eq(ResetPasswordTokenSchema.token, token.token));

      expect(token2.expiresAt.getTime()).toBeGreaterThan(Date.now());

      expect(token.expiresAt).not.toEqual(previousResetPasswordToken[0].expiresAt);
      expect(previousResetPasswordToken[0].expiresAt.getTime()).toBeLessThan(Date.now());
    });

    it("Should return token on success", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });
      const user = await insertUser(Email, Password, superAdminId);

      await setInitialSecurityQuestion(
        {
          question1: 1,
          answer1: "name",
          question2: 1,
          answer2: "name",
        },
        {
          uuid: user.uuid,
        } as any
      );

      const token = await forgotPasswordService({ email: Email, answer1: "name", answer2: "name" });

      expect(token).toBeDefined();
      expect(token.token).toBeDefined();
      expect(token.email).toEqual(Email);
    });
  });

  describe("Reset Password", () => {
    it("Should throw 400 error on invalid token", async () => {
      const token = "invalid-token";

      try {
        expect(await resetPassword({ token, newPassword: Password })).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(400);
      }
    });

    it("Should expire token once it is used", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });
      const user = await insertUser(Email, Password, superAdminId);

      await setInitialSecurityQuestion(
        {
          question1: 1,
          answer1: "name",
          question2: 1,
          answer2: "name",
        },
        {
          uuid: user.uuid,
        } as any
      );

      const token = await forgotPasswordService({ email: Email, answer1: "name", answer2: "name" });
      await resetPassword({ token: token.token, newPassword: "Password" });

      try {
        expect(await resetPassword({ token: token.token, newPassword: "Password" })).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(400);

        const token = await db.select().from(ResetPasswordTokenSchema).where(eq(ResetPasswordTokenSchema.userUuid, user.uuid));

        expect(token[0].expiresAt.getTime()).toBeLessThan(Date.now());
      }
    });

    it("Should reset password on success", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });
      const user = await insertUser(Email, Password, superAdminId);

      await setInitialSecurityQuestion(
        {
          question1: 1,
          answer1: "name",
          question2: 1,
          answer2: "name",
        },
        {
          uuid: user.uuid,
        } as any
      );

      const newPassword = "Password";
      const token = await forgotPasswordService({ email: Email, answer1: "name", answer2: "name" });
      await resetPassword({ token: token.token, newPassword: newPassword });

      const updatePasswordUser = await db.select().from(UserSchema).where(eq(UserSchema.uuid, user.uuid));

      expect(updatePasswordUser[0].password).not.toEqual(user.password);
      expect(await bcrypt.compare(newPassword, updatePasswordUser[0].password)).toEqual(true);
    });
  });

  describe("Set Security Question", () => {
    it("Should throw 404 error on user not found", async () => {
      try {
        expect(
          await setInitialSecurityQuestion(
            {
              answer1: "",
              answer2: "",
              question1: 1,
              question2: 1,
            },
            { uuid: uuid.v4() } as any
          )
        );
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(404);
      }
    });

    it("Should throw 409 error on security question already added", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });
      const user = await insertUser(Email, Password, superAdminId);

      await setInitialSecurityQuestion(
        {
          answer1: "",
          answer2: "",
          question1: 1,
          question2: 1,
        },
        { uuid: user.uuid } as any
      );

      try {
        expect(
          await setInitialSecurityQuestion(
            {
              answer1: "",
              answer2: "",
              question1: 1,
              question2: 1,
            },
            { uuid: user.uuid } as any
          )
        );
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(409);
      }
    });

    it("Should add security questions", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });
      const user = await insertUser(Email, Password, superAdminId);

      await setInitialSecurityQuestion(
        {
          answer1: "none",
          answer2: "none",
          question1: 1,
          question2: 1,
        },
        { uuid: user.uuid } as any
      );

      const questions = await db.select().from(SecurityQuestionSchema).where(eq(SecurityQuestionSchema.userUuid, user.uuid));

      expect(questions.length).toBe(1);
      expect(await bcrypt.compare("none", questions[0].answer1)).toEqual(true);
      expect(await bcrypt.compare("none", questions[0].answer2)).toEqual(true);
    });
  });

  describe("Update Security Question", () => {
    it("Should throw 404 error on user not found", async () => {
      try {
        expect(
          await updateSecurityQuestion(
            {
              answer1: "none",
              answer2: "none",
              question1: 1,
              question2: 1,
              password: "",
            },
            { uuid: uuid.v4() } as any
          )
        ).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(404);
      }
    });

    it("Should throw 400 error on incorrect current password", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });
      const user = await insertUser(Email, Password, superAdminId);

      try {
        expect(
          await updateSecurityQuestion(
            {
              answer1: "none",
              answer2: "none",
              question1: 1,
              question2: 1,
              password: "",
            },
            { uuid: user.uuid } as any
          )
        ).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(400);
      }
    });

    it("Should create security question if not already inserted", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });
      const user = await insertUser(Email, Password, superAdminId);

      await updateSecurityQuestion(
        {
          answer1: "none",
          answer2: "none",
          question1: 1,
          question2: 1,
          password: Password,
        },
        { uuid: user.uuid } as any
      );

      const questions = await db.select().from(SecurityQuestionSchema).where(eq(SecurityQuestionSchema.userUuid, user.uuid));

      expect(questions.length).toBe(1);
      expect(await bcrypt.compare("none", questions[0].answer1)).toEqual(true);
      expect(await bcrypt.compare("none", questions[0].answer2)).toEqual(true);
    });

    it("Should update security question on success", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });
      const user = await insertUser(Email, Password, superAdminId);

      await setInitialSecurityQuestion(
        {
          answer1: "none1",
          answer2: "none1",
          question1: 1,
          question2: 1,
        },
        { uuid: user.uuid } as any
      );

      await updateSecurityQuestion(
        {
          answer1: "none",
          answer2: "none",
          question1: 1,
          question2: 1,
          password: Password,
        },
        { uuid: user.uuid } as any
      );

      const questions = await db.select().from(SecurityQuestionSchema).where(eq(SecurityQuestionSchema.userUuid, user.uuid));

      expect(questions.length).toBe(1);
      expect(await bcrypt.compare("none", questions[0].answer1)).toEqual(true);
      expect(await bcrypt.compare("none", questions[0].answer2)).toEqual(true);
    });
  });

  describe("Update Password", () => {
    it("Should throw 404 error on user not found", async () => {
      try {
        expect(
          await updatePassword(
            {
              currentPassword: Password,
              confirmPassword: "Password",
              newPassword: "Password",
            },
            { uuid: uuid.v4() } as any
          )
        ).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(404);
      }
    });

    it("Should throw 400 error on incorrect current password", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });
      const user = await insertUser(Email, Password, superAdminId);

      try {
        expect(
          await updatePassword(
            {
              currentPassword: "Password",
              confirmPassword: "Password",
              newPassword: "Password",
            },
            { uuid: user.uuid } as any
          )
        ).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(400);
      }
    });

    it("Should update password on success", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });
      const user = await insertUser(Email, Password, superAdminId);

      await updatePassword(
        {
          currentPassword: Password,
          confirmPassword: "Password",
          newPassword: "Password",
        },
        { uuid: user.uuid } as any
      );

      const updatedUser = await db.select().from(UserSchema).where(eq(UserSchema.uuid, user.uuid));

      expect(await bcrypt.compare(Password, updatedUser[0].password)).toEqual(false);
    });
  });
});
