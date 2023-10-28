import { BackendError } from "@/types/common_types";
import axios from "axios";
import { toast } from "sonner";

export function handleError(error: unknown) {
  if (axios.isAxiosError<BackendError>(error)) {
    const errors = error.response?.data.errors;

    if (!errors) {
      showErrorToast("Internal Server Error");
      return;
    }

    const { _errors, ...restErrors } = errors;

    _errors.forEach((message) => showErrorToast(message));

    Object.keys(restErrors).forEach((key) => {
      restErrors[key]._errors.forEach((message) => showErrorToast(message, key));
    });
    return;
  }

  if (error instanceof Error) {
    console.log(error);
    showErrorToast(error.message);
  }
}

function showErrorToast(message: string, key?: string) {
  if (key) {
    toast.error(`${key}: ${message}`);
  } else {
    toast.error(message);
  }
}
