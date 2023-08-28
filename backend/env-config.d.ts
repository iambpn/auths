import { ENV_VARIABLE } from "./src/_env.type";

declare global {
  namespace NodeJS {
    interface ProcessEnv
      extends Partial<ENV_VARIABLE> {}
  }
}
