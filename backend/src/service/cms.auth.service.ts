import bcrypt from "bcrypt";
import { and, desc, eq, gte } from "drizzle-orm";
import jwt from "jsonwebtoken";
import * as uuid from "uuid";
import { db } from "../schema/drizzle-migrate";
import { ResetPasswordToken, RolesPermissionsSchema, RolesSchema, SecurityQuestionSchema, UserSchema } from "../schema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { getRandomKey } from "../utils/helper/getRandomKey";
import { HttpError } from "../utils/helper/httpError";
import { minutesToMilliseconds } from "../utils/helper/miliseconds";
import { ForgotPasswordType } from "../utils/validation_schema/cms/forgotPassword.validation.schema";
import { ResetPasswordValidationType } from "../utils/validation_schema/cms/resetPassword.validation.schema";
import { ENV_VARS } from "./env.service";
import { SetSecurityQnAType } from "../utils/validation_schema/cms/setSecurityQnA.validation.schema";
import { CmsRequestUser } from "../utils/types/req.user.type";
import { getRoleById, getSuperAdminRole } from "./roles.service";
import { ValidateEmailType } from "../utils/validation_schema/cms/verifyEmail.validation.schema";
import { QuestionsType1, QuestionsType2 } from "../utils/config/securityQuestion.config";

export async function loginService(email: string, password: string) {
  const [user] = await db
    .select({
      email: UserSchema.email,
      password: UserSchema.password,
      uuid: UserSchema.uuid,
      role: UserSchema.role,
    })
    .from(UserSchema)
    .where(eq(UserSchema.email, email))
    .limit(1);

  if (!user) {
    throw new HttpError("Incorrect email or password", 404);
  }

  const superAdminRole = await getSuperAdminRole();

  if (user.role !== superAdminRole.uuid) {
    throw new HttpError("Unauthorized", 401);
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new HttpError("Incorrect email or password", 404);
  }

  const rolesPermission = await getRoleById(superAdminRole.uuid);

  // encode email and additional payload to jwt token
  const payload = { ...user, password: undefined, role: rolesPermission };
  const jwtToken = jwt.sign(payload, ENV_VARS.AUTHS_SECRET, { expiresIn: ENV_VARS.AUTHS_JWT_EXPIRATION_TIME ?? minutesToMilliseconds(60 * 24) });

  return {
    uuid: user.uuid,
    jwtToken,
  };
}

export async function validateEmail(data: ValidateEmailType) {
  const [user] = await db
    .select({
      email: UserSchema.email,
      password: UserSchema.password,
      uuid: UserSchema.uuid,
      role: UserSchema.role,
    })
    .from(UserSchema)
    .where(eq(UserSchema.email, data.email))
    .limit(1);

  if (!user) {
    throw new HttpError("Incorrect email or password", 404);
  }

  const superAdminRole = await getSuperAdminRole();

  if (user.role !== superAdminRole.uuid) {
    throw new HttpError("Unauthorized", 401);
  }

  const [securityQuestion] = await db.select().from(SecurityQuestionSchema).where(eq(SecurityQuestionSchema.userUuid, user.uuid)).limit(1);

  if (!securityQuestion) {
    throw new HttpError("Security question is not configured", 400);
  }

  return {
    email: user.email,
    question1: QuestionsType1[securityQuestion.question1],
    question2: QuestionsType2[securityQuestion.question2],
  };
}

export async function forgotPasswordService(data: ForgotPasswordType) {
  const [user] = await db
    .select({
      email: UserSchema.email,
      password: UserSchema.password,
      uuid: UserSchema.uuid,
      role: UserSchema.role,
    })
    .from(UserSchema)
    .where(eq(UserSchema.email, data.email))
    .limit(1);

  if (!user) {
    throw new HttpError("Incorrect email or password", 404);
  }

  const superAdminRole = await getSuperAdminRole();

  if (user.role !== superAdminRole.uuid) {
    throw new HttpError("Unauthorized", 401);
  }

  const [securityQuestion] = await db.select().from(SecurityQuestionSchema).where(eq(SecurityQuestionSchema.userUuid, user.uuid)).limit(1);

  if (!(await bcrypt.compare(data.answer1, securityQuestion.answer1)) || !(await bcrypt.compare(data.answer2, securityQuestion.answer2))) {
    throw new HttpError("Invalid Security Question or Answer", 404);
  }

  // disable previous toke
  const [prevToken] = await db.select().from(ResetPasswordToken).where(eq(ResetPasswordToken.userUuid, user.uuid)).orderBy(desc(ResetPasswordToken.createdAt)).limit(1);

  if (prevToken) {
    await db
      .update(ResetPasswordToken)
      .set({
        expiresAt: new Date(),
      })
      .where(eq(ResetPasswordToken.uuid, prevToken.uuid));
  }

  // add new token
  const token = getRandomKey(16);
  const [resetToken] = await db
    .insert(ResetPasswordToken)
    .values({
      uuid: uuid.v4(),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + minutesToMilliseconds(5)),
      token: token,
      userUuid: user.uuid,
    })
    .returning();

  return {
    token: resetToken.token,
    expiresAt: resetToken.expiresAt,
    email: user.email,
  };
}

export async function resetPassword(data: ResetPasswordValidationType) {
  const [token] = await db
    .select()
    .from(ResetPasswordToken)
    .where(and(eq(ResetPasswordToken.token, data.token), gte(ResetPasswordToken.expiresAt, new Date())))
    .orderBy(desc(ResetPasswordToken.createdAt))
    .limit(1);

  if (!token) {
    throw new HttpError("Invalid Token", 404);
  }

  const [user] = await db.select().from(UserSchema).where(eq(UserSchema.uuid, token.userUuid)).limit(1);

  if (!user) {
    throw new HttpError("User not found", 404);
  }

  // disable used token
  await db
    .update(ResetPasswordToken)
    .set({
      expiresAt: new Date(),
    })
    .where(eq(ResetPasswordToken.uuid, token.uuid));

  // update password
  const newPasswordHash = await bcrypt.hash(data.newPassword, config.hashRounds());
  await db
    .update(UserSchema)
    .set({
      password: newPasswordHash,
    })
    .where(eq(UserSchema.uuid, user.uuid));

  return {
    message: "Password changed successfully",
  };
}

export function getSecurityQuestions() {
  return {
    question1s: QuestionsType1,
    question2s: QuestionsType2,
  };
}

export async function setInitialSecurityQuestion(data: SetSecurityQnAType, currentUser: CmsRequestUser) {
  const [user] = await db.select().from(UserSchema).where(eq(UserSchema.uuid, currentUser.uuid)).limit(1);

  if (!user) {
    throw new HttpError("User not found", 404);
  }

  if (user.isRecoverable) {
    throw new HttpError("Security Question already added.", 409);
  }

  const encryptAnswer1 = await bcrypt.hash(data.answer1, config.hashRounds());
  const encryptAnswer2 = await bcrypt.hash(data.answer2, config.hashRounds());

  await db.insert(SecurityQuestionSchema).values({
    answer1: encryptAnswer1,
    answer2: encryptAnswer2,
    question1: data.question1,
    question2: data.question2,
    createdAt: new Date(),
    updatedAt: new Date(),
    userUuid: user.uuid,
    uuid: uuid.v4(),
  });

  await db
    .update(UserSchema)
    .set({
      isRecoverable: true,
    })
    .where(eq(UserSchema.uuid, user.uuid));

  return {
    message: "Security Question added successfully",
  };
}
