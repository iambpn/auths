import { ENV_VARIABLE, ADDITIONAL_REQUEST_PROPERTIES } from "./src/_app.type";
import { Request } from "express";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Partial<ENV_VARIABLE> {}
  }

  namespace Express {
    interface Request extends ADDITIONAL_REQUEST_PROPERTIES {}
  }
}
