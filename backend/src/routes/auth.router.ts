import { Router, Request, Response } from "express";
import { validate } from "../utils/helper/validation";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { UserSchema } from "../schema/drizzle-schema";

export const router = Router();

router.post("/", validate(createInsertSchema(UserSchema).pick({ email: true, password: true })), (req: Request, res: Response) => {
  res.send("hello world");
});
