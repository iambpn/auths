import { UserTable } from "./drizzle-schema";

export interface Database {
  user: UserTable;
}
