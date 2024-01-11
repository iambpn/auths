export interface ENV_VARIABLE {
  AUTHS_DB_URI: string;
  AUTHS_SECRET: string;
  AUTHS_JWT_EXPIRATION_TIME: string;
  AUTHS_LOGIN_TOKEN_EXPIRATION_TIME: string;
  AUTHS_HASH_SALT_ROUNDS: string;
  AUTHS_DB_DRIVER: string;
}

export interface ADDITIONAL_REQUEST_PROPERTIES {
  currentUser?: Record<string, any>;
}
