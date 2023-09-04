export type ErrorResponse = {
  errors: Zod.ZodFormattedError<string, string>;
  path: string;
  time: Date;
};
