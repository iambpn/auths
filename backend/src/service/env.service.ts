import { ZodError, z } from "zod";
import { ValidateEnvType, validateEnvSchema } from "../utils/validation_schema/validateEnv.validation.schema";

export let ENV_VARS: ValidateEnvType;

/**
 * @throws Error
 */
export function validateEnv() {
  try {
    ENV_VARS = validateEnvSchema.parse({
      AUTHS_DB_URI: process.env.AUTHS_DB_URI!,
      AUTHS_SECRET: process.env.AUTHS_SECRET!,
    } satisfies ValidateEnvType);
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
