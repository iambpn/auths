import { ZodError } from "zod";
import { ENV_VARIABLE } from "../_app.type";
import { ValidateEnvType, validateEnvSchema } from "../utils/validation_schema/auths/validateEnv.validation.schema";

export let ENV_VARS: ValidateEnvType;

/**
 * @throws Error
 */
export function validateEnv() {
  try {
    ENV_VARS = validateEnvSchema.parse({
      AUTHS_DB_URI: process.env.AUTHS_DB_URI!,
      AUTHS_SECRET: process.env.AUTHS_SECRET!,
      AUTHS_JWT_EXPIRATION_TIME: process.env.AUTHS_JWT_EXPIRATION_TIME!,
      AUTHS_LOGIN_TOKEN_EXPIRATION_TIME: process.env.AUTHS_LOGIN_TOKEN_EXPIRATION_TIME!,
      AUTHS_HASH_SALT_ROUNDS: process.env.AUTHS_HASH_SALT_ROUNDS!,
      AUTHS_DB_DRIVER: process.env.AUTHS_DB_DRIVER!,
      AUTHS_DB_HOST: process.env.AUTHS_DB_HOST!,
      AUTHS_DB_PORT: process.env.AUTHS_DB_PORT!,
      AUTHS_DB_USERNAME: process.env.AUTHS_DB_USERNAME!,
      AUTHS_DB_PASSWORD: process.env.AUTHS_DB_PASSWORD!,
      AUTHS_DB_NAME: process.env.AUTHS_DB_NAME!,
    } satisfies { [key in keyof ValidateEnvType | keyof ENV_VARIABLE]: any });
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = [];
      for (const err of error.errors) {
        errors.push(`Incorrect or Missing ${err.path.join(", ")} env variable`);
      }
      throw new Error(JSON.stringify(errors));
    }

    throw error;
  }
}
