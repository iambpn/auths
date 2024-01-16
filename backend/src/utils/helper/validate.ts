import { NextFunction, Request, Response } from "express";
import { z } from "zod";

/**
 *
 * @param schema
 * @param type default 'body'
 * @returns
 */
export function validate(schema: z.Schema, type: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    schema.parse(req[type]);
    next();
  };
}
