import { z } from "zod";

export const QueryParamsValidationSchema = z.object({
  keyword: z.string().trim().optional(),
});

export const SearchQueryValidationSchema = QueryParamsValidationSchema.pick({
  keyword: true,
});

export type SearchQueryType = z.infer<typeof SearchQueryValidationSchema>;
