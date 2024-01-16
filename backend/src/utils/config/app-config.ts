import { ENV_VARS } from "../../service/env.service";
import { minutesToMilliseconds } from "../helper/miliseconds";

export const config = {
  hashRounds: () => ENV_VARS.AUTHS_HASH_SALT_ROUNDS ?? 10,
  loginTokenExpiration: () => +(ENV_VARS.AUTHS_LOGIN_TOKEN_EXPIRATION_TIME ?? minutesToMilliseconds(5)), // milliseconds
  jwtTokenExpiration: () => +(ENV_VARS.AUTHS_JWT_EXPIRATION_TIME ?? minutesToMilliseconds(60 * 24)) / 1000, // seconds
  resetPasswordExpiration: () => minutesToMilliseconds(5),
  superAdminSlug: "superAdmin__default",
  printFormattedLog: (message: string) => {
    console.log(`** [AUTHS] ${message}`);
  },
};
