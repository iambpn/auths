import { LoginTokenTable, UserTable } from "./drizzle-schema";

export interface Database {
  user: UserTable;
  loginToken: LoginTokenTable;
}
