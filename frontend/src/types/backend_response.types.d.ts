type Prettify<T> = {
  [K in keyof T]: T[K];
} & {
  //
};

type PaginatedResponse<T> = Prettify<
  {
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPage: number;
  } & T
>;

declare namespace APIResponse {
  export type CMS = {
    "GET-getSecurityQuestion": {
      question1s: string[];
      question2s: string[];
    };
    "POST-verifyEmail": {
      email: string;
      question1: string;
      question2: string;
    };
    "PUT-updatePassword": { message: string };
    "PUT-updateSecurityQuestion": { message: string };
    "POST-setSecurityQuestion": { message: string };
    "POST-forgotPassword": {
      token: string;
      expiresAt: string;
      email: string;
    };
    "POST-login": {
      uuid: string;
      jwtToken: string;
    };
    "POST-resetPassword": { message: string };
  };

  export type Permission = {
    "GET-id": {
      createdAt: Date;
      name: string;
      slug: string;
      uuid: string;
      updatedAt: Date;
    };
    "GET-/": PaginatedResponse<{ permissions: Permission["GET-id"][] }>;
    "POST-/": Permission["GET-id"];
    "PUT-id": Permission["GET-id"];
    "DELETE-id": Permission["GET-id"];
    "GET-id/roles": PaginatedResponse<{
      roles: {
        uuid: string;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
      }[];
    }>;
    "POST-assignRoles/id": {
      removeUuid: string[];
      insertedUuid: string[];
    };
  };

  export type Roles = {
    "GET-id": {
      permissions: {
        uuid: string;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
      }[];
      uuid: string;
      name: string;
      slug: string;
      createdAt: Date;
      updatedAt: Date;
    };
    "GET-/": PaginatedResponse<{ roles: Roles["GET-id"][] }>;
    "POST-/": Roles["GET-id"];
    "PUT-id": Roles["GET-id"];
    "DELETE-id": Roles["GET-id"];
    "POST-assignPermission/id": {
      removeUuid: string[];
      insertedUuid: string[];
    };
  };

  export type Users = {
    "GET-id": {
      role: {
        uuid: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
      };
      uuid: string;
      email: string;
      others: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    "GET-/": PaginatedResponse<{ users: Users["GET-id"][] }>;
  };

  export type Auths = {
    cmsUser: {
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
  };
}
