import { z } from "zod";
import { Auths_DB_Driver, ENV_VARIABLE } from "../../../_app.type";

export const validateEnvSchema = z
  .object({
    AUTHS_SECRET: z.string(),
    AUTHS_JWT_EXPIRATION_TIME: z.string().optional(),
    AUTHS_LOGIN_TOKEN_EXPIRATION_TIME: z.string().optional(),
    AUTHS_HASH_SALT_ROUNDS: z.coerce.number().optional(),
    AUTHS_DB_DRIVER: z.enum(["node-postgres", "better-sqlite", "mysql2"] satisfies Auths_DB_Driver),
    AUTHS_DB_URI: z.string().optional(),
    AUTHS_DB_HOST: z.string().optional(),
    AUTHS_DB_PORT: z.coerce.number().optional(),
    AUTHS_DB_PASSWORD: z.string().optional(),
    AUTHS_DB_USERNAME: z.string().optional(),
    AUTHS_DB_NAME: z.string().optional(),
  } satisfies Record<keyof ENV_VARIABLE, any>)
  .refine(
    (args) => {
      if (args.AUTHS_DB_DRIVER === "better-sqlite" && args.AUTHS_DB_URI === undefined) {
        return false;
      }

      return true;
    },
    {
      message: "AUTHS_DB_URI is required when AUTHS_DB_DRIVER is 'sqlite'",
      path: ["AUTHS_DB_URI"],
    }
  )
  .refine(
    (args) => {
      if (
        (args.AUTHS_DB_DRIVER === "node-postgres" || args.AUTHS_DB_DRIVER === "mysql2") &&
        (args.AUTHS_DB_HOST === undefined ||
          args.AUTHS_DB_PORT === undefined ||
          args.AUTHS_DB_USERNAME === undefined ||
          args.AUTHS_DB_PASSWORD === undefined ||
          args.AUTHS_DB_NAME === undefined)
      ) {
        return false;
      }

      return true;
    },
    {
      message:
        "AUTHS_DB_HOST, AUTHS_DB_PORT, AUTHS_DB_USERNAME, AUTHS_DB_PASSWORD, and AUTHS_DB_NAME are required when AUTHS_DB_DRIVER is 'postgres' or 'mysql'",
      path: ["AUTHS_DB_HOST", "AUTHS_DB_PORT", "AUTHS_DB_USERNAME", "AUTHS_DB_PASSWORD", "AUTHS_DB_NAME"],
    }
  );

export type ValidateEnvType = z.infer<typeof validateEnvSchema>;
