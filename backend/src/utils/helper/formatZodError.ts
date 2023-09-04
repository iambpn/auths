import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export function formatZodError(error: ZodError) {
  const validationError = fromZodError(error);
  console.error(validationError);
  const message = validationError.message.split(":").slice(1).join(":").trim();
  return message.split(";");
}
