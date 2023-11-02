export interface BackendError {
  errors: Errors & {
    [k: string]: Errors;
  };
  path: string;
  time: string;
}

interface Errors {
  _errors: string[];
}
