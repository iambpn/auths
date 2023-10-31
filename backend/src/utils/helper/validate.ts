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
    switch (type) {
      case "body":
        schema.parse(req.body);
        break;
      case "params":
        schema.parse(req.params);
        break;
      case "query":
        schema.parse(req.query);
        break;
    }
    next();
  };
}
