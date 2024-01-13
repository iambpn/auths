import bcrypt from "bcrypt";
import { and, desc, eq, gte } from "drizzle-orm";
import jwt from "jsonwebtoken";
import * as uuid from "uuid";
import { db } from "../dbSchema/drizzle-migrate";
import { schema } from "../dbSchema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { QuestionsType1, QuestionsType2 } from "../utils/config/securityQuestion.config";
import { getRandomKey } from "../utils/helper/getRandomKey";
import { HttpError } from "../utils/helper/httpError";
import { CmsRequestUser } from "../utils/types/req.user.type";
import { ForgotPasswordType } from "../utils/validation_schema/cms/forgotPassword.validation.schema";
import { ResetPasswordValidationType } from "../utils/validation_schema/cms/resetPassword.validation.schema";
import { SetSecurityQnAType } from "../utils/validation_schema/cms/setSecurityQnA.validation.schema";
import { UpdatePasswordValidationType } from "../utils/validation_schema/cms/updatePassword.validation.schema";
import { UpdateSecurityQnAType } from "../utils/validation_schema/cms/updateSecurityQnA.validation.schema";
import { ValidateEmailType } from "../utils/validation_schema/cms/verifyEmail.validation.schema";
import { ENV_VARS } from "./env.service";
import { getRoleById, getSuperAdminRole } from "./roles.service";

export async function loginService(email: string, password: string) {
  const [user] = await db
    .select({
      email: schema.UserSchema.email,
      password: schema.UserSchema.password,
      uuid: schema.UserSchema.uuid,
      role: schema.UserSchema.role,
    })
    .from(schema.UserSchema)
    .where(eq(schema.UserSchema.email, email))
    .limit(1);

  if (!user) {
    throw new HttpError("Incorrect email or password", 404);
  }

  const superAdminRole = await getSuperAdminRole();

  if (user.role !== superAdminRole.uuid) {
    throw new HttpError("Unauthorized - Insufficient role", 401);
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new HttpError("Incorrect email or password", 400);
  }

  const rolesPermission = await getRoleById(superAdminRole.uuid);

  // encode email and additional payload to jwt token
  const payload = { ...user, password: undefined, role: rolesPermission };
  const jwtToken = jwt.sign(payload, ENV_VARS.AUTHS_SECRET, { expiresIn: config.jwtTokenExpiration() });

  return {
    uuid: user.uuid,
    jwtToken,
  };
}

// verify email form forger password
export async function validateSuperadminEmail(data: ValidateEmailType) {
  const [user] = await db
    .select({
      email: schema.UserSchema.email,
      password: schema.UserSchema.password,
      uuid: schema.UserSchema.uuid,
      role: schema.UserSchema.role,
    })
    .from(schema.UserSchema)
    .where(eq(schema.UserSchema.email, data.email))
    .limit(1);

  if (!user) {
    throw new HttpError("Incorrect email or password", 404);
  }

  const superAdminRole = await getSuperAdminRole();

  if (user.role !== superAdminRole.uuid) {
    throw new HttpError("Unauthorized", 401);
  }

  const [securityQuestion] = await db
    .select()
    .from(schema.SecurityQuestionSchema)
    .where(eq(schema.SecurityQuestionSchema.userUuid, user.uuid))
    .limit(1);

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
      email: schema.UserSchema.email,
      password: schema.UserSchema.password,
      uuid: schema.UserSchema.uuid,
      role: schema.UserSchema.role,
    })
    .from(schema.UserSchema)
    .where(eq(schema.UserSchema.email, data.email))
    .limit(1);

  if (!user) {
    throw new HttpError("Incorrect email or password", 404);
  }

  const superAdminRole = await getSuperAdminRole();

  if (user.role !== superAdminRole.uuid) {
    throw new HttpError("Unauthorized", 401);
  }

  const [securityQuestion] = await db
    .select()
    .from(schema.SecurityQuestionSchema)
    .where(eq(schema.SecurityQuestionSchema.userUuid, user.uuid))
    .limit(1);

  if (
    !securityQuestion ||
    !(await bcrypt.compare(data.answer1, securityQuestion.answer1)) ||
    !(await bcrypt.compare(data.answer2, securityQuestion.answer2))
  ) {
    throw new HttpError("Invalid Security Question or Answer", 400);
  }

  // disable previous token
  const [prevToken] = await db
    .select()
    .from(schema.ResetPasswordTokenSchema)
    .where(eq(schema.ResetPasswordTokenSchema.userUuid, user.uuid))
    .orderBy(desc(schema.ResetPasswordTokenSchema.createdAt))
    .limit(1);

  if (prevToken) {
    await db
      .update(schema.ResetPasswordTokenSchema)
      .set({
        expiresAt: new Date(),
      })
      .where(eq(schema.ResetPasswordTokenSchema.uuid, prevToken.uuid));
  }

  // add new token
  const token = getRandomKey(16);
  await db.insert(schema.ResetPasswordTokenSchema).values({
    uuid: uuid.v4(),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + config.resetPasswordExpiration()),
    token: token,
    userUuid: user.uuid,
  });
  const [resetToken] = await db.select().from(schema.ResetPasswordTokenSchema).where(eq(schema.ResetPasswordTokenSchema.token, token)).limit(1);

  return {
    token: resetToken.token,
    expiresAt: resetToken.expiresAt,
    email: user.email,
  };
}

export async function resetPassword(data: ResetPasswordValidationType) {
  const [token] = await db
    .select()
    .from(schema.ResetPasswordTokenSchema)
    .where(and(eq(schema.ResetPasswordTokenSchema.token, data.token), gte(schema.ResetPasswordTokenSchema.expiresAt, new Date())))
    .orderBy(desc(schema.ResetPasswordTokenSchema.createdAt))
    .limit(1);

  if (!token) {
    throw new HttpError("Invalid Reset Token", 400);
  }

  const [user] = await db.select().from(schema.UserSchema).where(eq(schema.UserSchema.uuid, token.userUuid)).limit(1);

  if (!user) {
    throw new HttpError("User not found", 404);
  }

  // disable used token
  await db
    .update(schema.ResetPasswordTokenSchema)
    .set({
      expiresAt: new Date(),
    })
    .where(eq(schema.ResetPasswordTokenSchema.uuid, token.uuid));

  // update password
  const newPasswordHash = await bcrypt.hash(data.newPassword, config.hashRounds());
  await db
    .update(schema.UserSchema)
    .set({
      password: newPasswordHash,
    })
    .where(eq(schema.UserSchema.uuid, user.uuid));

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
  const [user] = await db.select().from(schema.UserSchema).where(eq(schema.UserSchema.uuid, currentUser.uuid)).limit(1);

  if (!user) {
    throw new HttpError("User not found", 404);
  }

  if (user.isRecoverable) {
    throw new HttpError("Security Question already added.", 409);
  }

  const encryptAnswer1 = await bcrypt.hash(data.answer1, config.hashRounds());
  const encryptAnswer2 = await bcrypt.hash(data.answer2, config.hashRounds());

  await db.insert(schema.SecurityQuestionSchema).values({
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
    .update(schema.UserSchema)
    .set({
      isRecoverable: true,
    })
    .where(eq(schema.UserSchema.uuid, user.uuid));

  return {
    message: "Security Question added successfully",
  };
}

export async function updateSecurityQuestion(data: UpdateSecurityQnAType, currentUser: CmsRequestUser) {
  const [user] = await db.select().from(schema.UserSchema).where(eq(schema.UserSchema.uuid, currentUser.uuid)).limit(1);

  if (!user) {
    throw new HttpError("User not found", 404);
  }

  if (!(await bcrypt.compare(data.password, user.password))) {
    throw new HttpError("Incorrect current password", 400);
  }

  const encryptAnswer1 = await bcrypt.hash(data.answer1, config.hashRounds());
  const encryptAnswer2 = await bcrypt.hash(data.answer2, config.hashRounds());

  if (!user.isRecoverable) {
    await db.insert(schema.SecurityQuestionSchema).values({
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
      .update(schema.UserSchema)
      .set({
        isRecoverable: true,
      })
      .where(eq(schema.UserSchema.uuid, user.uuid));

    return {
      message: "Security QnA added successfully",
    };
  }

  await db
    .update(schema.SecurityQuestionSchema)
    .set({ answer1: encryptAnswer1, answer2: encryptAnswer2, question1: data.question1, question2: data.question2, updatedAt: new Date() })
    .where(eq(schema.SecurityQuestionSchema.userUuid, user.uuid));

  return {
    message: "Security QnA updated successfully",
  };
}

export async function updatePassword(data: UpdatePasswordValidationType, currentUser: CmsRequestUser) {
  const [user] = await db.select().from(schema.UserSchema).where(eq(schema.UserSchema.uuid, currentUser.uuid)).limit(1);

  if (!user) {
    throw new HttpError("User not found", 404);
  }

  if (!(await bcrypt.compare(data.currentPassword, user.password))) {
    throw new HttpError("Incorrect current password", 400);
  }

  const encryptPassword = await bcrypt.hash(data.newPassword, config.hashRounds());
  await db
    .update(schema.UserSchema)
    .set({
      password: encryptPassword,
    })
    .where(eq(schema.UserSchema.uuid, currentUser.uuid));

  return {
    message: "Password updated successfully",
  };
}
