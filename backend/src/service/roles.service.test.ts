import { db } from "../schema/__mocks__/drizzle-migrate";
import * as uuid from "uuid";
import { PermissionSchema, RolesSchema } from "../schema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { assignPermissionsToRole, getAllRoles, getRoleById } from "./roles.service";
import { HttpError } from "../utils/helper/httpError";

//  mocking drizzle instance using manual mocking
jest.mock("../schema/drizzle-migrate");

const UserRole = { uuid: uuid.v4(), slug: "test_role" };
const DefaultPermission = { uuid: uuid.v4(), slug: "default_permission" };

async function insertRole(role: typeof UserRole) {
  await db.insert(RolesSchema).values({
    name: role.slug,
    slug: role.slug,
    uuid: role.uuid,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function insertPermission(permission: typeof DefaultPermission) {
  await db.insert(PermissionSchema).values({
    name: permission.slug,
    slug: permission.slug,
    uuid: permission.uuid,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("Role Service Testing", () => {
  describe("Get All Roles", () => {
    it("Should return all roles following pagination", async () => {
      await insertRole(UserRole);
      await insertRole({
        slug: config.superAdminSlug,
        uuid: uuid.v4(),
      });

      const result = await db.select().from(RolesSchema);
      expect(result.length).toBe(2);

      const allRoles = await getAllRoles({ limit: 1, skip: 0 });

      expect(allRoles.roles.length).toBe(1);
    });

    it("Should return all roles following pagination's skip parameter", async () => {
      await insertRole(UserRole);
      await insertRole({
        slug: config.superAdminSlug,
        uuid: uuid.v4(),
      });

      const result = await db.select().from(RolesSchema);
      expect(result.length).toBe(2);

      const allRoles = await getAllRoles({ limit: 1, skip: 1 });

      expect(allRoles.roles.length).toBe(1);
      expect(allRoles.roles[0].slug).toBe(config.superAdminSlug);
    });

    it("Should return all roles following pagination and search keyword", async () => {
      await insertRole(UserRole);
      await insertRole({
        slug: config.superAdminSlug,
        uuid: uuid.v4(),
      });

      const result = await db.select().from(RolesSchema);
      expect(result.length).toBe(2);

      const allRoles = await getAllRoles({ limit: 1, skip: 0 }, "super");

      expect(allRoles.roles.length).toBe(1);
      expect(allRoles.roles[0].slug).toBe(config.superAdminSlug);
    });

    it("Should return all roles and permission following pagination and search keyword ", async () => {
      await insertRole(UserRole);
      await insertRole({
        slug: config.superAdminSlug,
        uuid: uuid.v4(),
      });

      await insertPermission(DefaultPermission);

      await assignPermissionsToRole(UserRole.uuid, { permissions: [DefaultPermission.uuid] });

      const result = await db.select().from(RolesSchema);
      expect(result.length).toBe(2);

      const allRoles = await getAllRoles({ limit: 1, skip: 0 }, "test", "true");

      expect(allRoles.roles.length).toBe(1);
      expect(allRoles.roles[0].slug).toBe(UserRole.slug);
      expect(allRoles.roles[0].permission.length).toBe(1);
      expect(allRoles.roles[0].permission[0].uuid).toBe(DefaultPermission.uuid);
    });
  });

  describe("Get Role By uuid", () => {
    it("Should throw 404 error on role not found", async () => {
      try {
        expect(await getRoleById(UserRole.uuid)).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(404);
      }
    });

    it("Should return role data with permission on success", async () => {
      await insertRole(UserRole);
      await insertPermission(DefaultPermission);
      await assignPermissionsToRole(UserRole.uuid, { permissions: [DefaultPermission.uuid] });
      const result = await getRoleById(UserRole.uuid);

      expect(result.slug).toBe(UserRole.slug);
      expect(result.permissions.length).toBe(1);
      expect(result.permissions[0].slug).toBe(DefaultPermission.slug);
    });
  });
});
