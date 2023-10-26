import { ENV_VARS } from "../../service/env.service";

export const config = {
  hashRounds: () => ENV_VARS.AUTHS_HASH_SALT_ROUNDS ?? 10,
};
