import { ENV_VARS } from "../../service/env.service";

console.log(ENV_VARS);

export const config = {
  hashRounds: () => ENV_VARS.AUTHS_HASH_SALT_ROUNDS ?? 10,
};
