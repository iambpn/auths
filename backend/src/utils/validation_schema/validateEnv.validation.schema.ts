import { z } from "zod";
import { ENV_VARIABLE } from "../../_app.type";

export const validateEnvSchema = z.object({
  AUTHS_DB_URI: z.string(),
  AUTHS_SECRET: z.string(),
  AUTHS_JWT_EXPIRATION_TIME: z.string().optional(),
  AUTHS_TOKEN_EXPIRATION_TIME: z.string().optional(),
} satisfies Record<keyof ENV_VARIABLE, any>);

export type ValidateEnvType = z.infer<typeof validateEnvSchema>;
