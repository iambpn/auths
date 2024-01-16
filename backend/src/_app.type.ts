export interface ENV_VARIABLE {
  AUTHS_DB_URI: string;
  AUTHS_SECRET: string;
  AUTHS_JWT_EXPIRATION_TIME: string;
  AUTHS_LOGIN_TOKEN_EXPIRATION_TIME: string;
  AUTHS_HASH_SALT_ROUNDS: string;
  AUTHS_DB_DRIVER: string;
  AUTHS_DB_HOST: string;
  AUTHS_DB_PORT: string;
  AUTHS_DB_USERNAME: string;
  AUTHS_DB_PASSWORD: string;
  AUTHS_DB_NAME: string;
}

export interface ADDITIONAL_REQUEST_PROPERTIES {
  currentUser?: Record<string, any>;
}

export type Auths_DB_Driver = ["node-postgres", "better-sqlite", "mysql2"];

export type ArrayToIntersection<T extends string[]> = T extends [infer A, ...infer R] ? (R extends string[] ? A | ArrayToIntersection<R> : R) : T[0];
