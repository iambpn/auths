export type currentUser = {
  role: {
    permissions: {
      uuid: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      slug: string;
    }[];
    uuid: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
  };
  email: string;
  uuid: string;
};

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
