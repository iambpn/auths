export interface ENV_VARIABLE {
  AUTHS_DB_URI: string;
  AUTHS_SECRET: string;
  AUTHS_JWT_EXPIRATION_TIME: string;
  AUTHS_TOKEN_EXPIRATION_TIME: string;
}

export interface ADDITIONAL_REQUEST_PROPERTIES {
  currentUser?: Record<string, any>;
}