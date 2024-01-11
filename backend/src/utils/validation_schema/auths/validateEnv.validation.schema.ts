import { z } from "zod";
import { ENV_VARIABLE } from "../../../_app.type";

export const validateEnvSchema = z.object({
  AUTHS_DB_URI: z.string(),
  AUTHS_SECRET: z.string(),
  AUTHS_JWT_EXPIRATION_TIME: z.string().optional(),
  AUTHS_LOGIN_TOKEN_EXPIRATION_TIME: z.string().optional(),
  AUTHS_HASH_SALT_ROUNDS: z.coerce.number().optional(),
  AUTHS_DB_DRIVER: z.enum(["postgres", "sqlite", "mysql"]),
} satisfies Record<keyof ENV_VARIABLE, any>);

export type ValidateEnvType = z.infer<typeof validateEnvSchema>;
