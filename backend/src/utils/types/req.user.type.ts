export type CmsRequestUser = {
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

export type AuthsRequestUser<T = Record<string, any>> = CmsRequestUser & T;
