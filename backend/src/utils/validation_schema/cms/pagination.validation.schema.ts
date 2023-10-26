import { z } from "zod";

export const paginationValidationSchema = z.object({
  page: z.coerce.number().int({
    message: "Invalid page number",
  }),
  limit: z.coerce.number().int({
    message: "Invalid page limit",
  }),
});

export type PaginationType = Record<keyof z.infer<typeof paginationValidationSchema>, string>;
