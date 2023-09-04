import { z } from "zod";

export function validate(schema: z.Schema) {
  return (req: any, res: any, next: any) => {
    schema.parse(req.body);
    next();
  };
}
