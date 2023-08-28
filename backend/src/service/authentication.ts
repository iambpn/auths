import { UserSchema } from "../schema/drizzle-schema";

function authenticate(username: string, password: string) {}

function saveUser(userData: typeof UserSchema.$inferSelect) {}
