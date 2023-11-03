import { z } from "zod";

export const QueryParamsValidationSchema = z.object({
  keyword: z.string().trim().optional(),
  withPermission: z
    .string()
    .refine((x) => x === "true" || x === "false", {
      message: "withPermission must be true or false",
    })
    .optional(),
});

export const SearchQueryValidationSchema = QueryParamsValidationSchema.pick({
  keyword: true,
});

export type SearchQueryType = z.infer<typeof SearchQueryValidationSchema>;

export const WithPermissionValidationSchema = QueryParamsValidationSchema.pick({
  withPermission: true,
});

export type WithPermissionType = z.infer<typeof WithPermissionValidationSchema>;
