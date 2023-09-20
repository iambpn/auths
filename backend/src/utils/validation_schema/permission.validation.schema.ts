import { z } from "zod";

const word_with_underscore_regex = /[^a-zA-Z0-9_]/;

export const permissionValidationSchema = z.object({
  permission: z.array(
    z.object({
      name: z
        .string({
          required_error: "Name is required",
        })
        .min(2, {
          message: "Name must be at least 2 characters",
        }),
      slug: z
        .string({
          required_error: "Slug is required",
        })
        .min(2, {
          message: "Slug must be at least 2 characters",
        })
        .refine((val) => Boolean(word_with_underscore_regex.test(val)), {
          message: "Slug especial characters are not allowed in slug",
        }),
    })
  ),
});
