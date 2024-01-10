import { db } from "../schema/__mocks__/drizzle-migrate";
import * as uuid from "uuid";
import { PermissionSchema, RolesPermissionsSchema, RolesSchema, UserSchema } from "../schema/drizzle-schema";
import { config } from "../utils/config/app-config";
import {
  assignPermissionsToRole,
  createRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  getRoleBySlug,
  getSuperAdminRole,
  updateRole,
} from "./roles.service";
import { HttpError } from "../utils/helper/httpError";
import { eq } from "drizzle-orm";

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

  describe("Get Role By Slug", () => {
    it("Should throw 404 error on role not found", async () => {
      try {
        expect(await getRoleBySlug(UserRole.slug)).toThrowError();
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
      const result = await getRoleBySlug(UserRole.slug);
      expect(result.slug).toBe(UserRole.slug);
      expect(result.permissions.length).toBe(1);
      expect(result.permissions[0].slug).toBe(DefaultPermission.slug);
    });
  });

  describe("Create Role", () => {
    it("Should throw 409 error on duplicate role slug", async () => {
      await insertRole(UserRole);
      try {
        expect(
          await createRole({
            name: UserRole.slug,
            slug: UserRole.slug,
          })
        ).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(409);
      }
    });

    it("Should create role on success", async () => {
      const result = await createRole({
        name: UserRole.slug,
        slug: UserRole.slug,
      });
      expect(result.slug).toBe(UserRole.slug);
    });
  });

  describe("Update Role", () => {
    it("Should throw 404 error on non-existent role", async () => {
      try {
        expect(
          await updateRole(UserRole.uuid, {
            name: UserRole.slug,
            slug: UserRole.slug,
          })
        ).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(404);
      }
    });

    it("Should throw 409 error on duplicate role slug", async () => {
      const superAdminId = uuid.v4();

      await insertRole(UserRole);
      await insertRole({
        uuid: superAdminId,
        slug: config.superAdminSlug,
      });

      try {
        expect(
          await updateRole(superAdminId, {
            name: UserRole.slug,
            slug: UserRole.slug,
          })
        ).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(409);
      }
    });

    it("Should update role", async () => {
      await insertRole(UserRole);

      const newRole = {
        name: "new Role",
        slug: "new_role",
      };

      const result = await updateRole(UserRole.uuid, {
        name: newRole.name,
        slug: newRole.slug,
      });

      expect(result.uuid).toBe(UserRole.uuid);
      expect(result.name).toBe(newRole.name);
      expect(result.slug).toBe(newRole.slug);
    });
  });

  describe("Delete Role", () => {
    it("Should throw 404 error on non-existent role", async () => {
      try {
        expect(await deleteRole(uuid.v4())).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(404);
      }
    });

    it("Should throw 400 error on deleting super admin role", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });

      try {
        expect(await deleteRole(superAdminId)).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(400);
      }
    });

    it("Should not allow to delete role that are in use", async () => {
      await insertRole(UserRole);

      await db.insert(UserSchema).values({
        password: "123456",
        email: "abc@gmail.com",
        role: UserRole.uuid,
        uuid: uuid.v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        expect(await deleteRole(UserRole.uuid)).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(409);
      }
    });

    it("Should delete role", async () => {
      await insertRole(UserRole);

      const result = await deleteRole(UserRole.uuid);

      expect(result).toBeDefined();

      const [role] = await db.select().from(RolesSchema).where(eq(RolesSchema.uuid, UserRole.uuid));

      expect(role).not.toBeDefined();
    });

    it("Should delete permission assigned to the role", async () => {
      await insertRole(UserRole);

      const permissionUuid = uuid.v4();
      await db.insert(PermissionSchema).values({
        name: "read",
        slug: "read",
        uuid: permissionUuid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await assignPermissionsToRole(UserRole.uuid, {
        permissions: [permissionUuid],
      });

      let linkedPermission = await db.select().from(RolesPermissionsSchema).where(eq(RolesPermissionsSchema.roleUuid, UserRole.uuid));

      expect(linkedPermission).toHaveLength(1);
      expect(linkedPermission[0].permissionUuid).toBe(permissionUuid);

      await deleteRole(UserRole.uuid);

      linkedPermission = await db.select().from(RolesPermissionsSchema).where(eq(RolesPermissionsSchema.roleUuid, UserRole.uuid));

      expect(linkedPermission).toHaveLength(0);
    });
  });

  describe("Assign Permission To Role", () => {
    it("Should assign permission to role", async () => {
      await insertRole(UserRole);

      const permissionUuid = uuid.v4();
      await db.insert(PermissionSchema).values({
        name: "read",
        slug: "read",
        uuid: permissionUuid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await assignPermissionsToRole(UserRole.uuid, {
        permissions: [permissionUuid],
      });

      let linkedPermission = await db.select().from(RolesPermissionsSchema).where(eq(RolesPermissionsSchema.roleUuid, UserRole.uuid));

      expect(linkedPermission).toHaveLength(1);
      expect(linkedPermission[0].permissionUuid).toBe(permissionUuid);
    });
  });

  describe("Get Superadmin Role", () => {
    it("Should throw 400 error on Suepradmin role not found", async () => {
      try {
        expect(await getSuperAdminRole()).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(400);
      }
    });

    it("Should return superadmin role", async () => {
      const superAdminId = uuid.v4();
      await insertRole({
        slug: config.superAdminSlug,
        uuid: superAdminId,
      });

      const superadminRole = await getSuperAdminRole();

      expect(superadminRole.slug).toBe(config.superAdminSlug);
    });
  });
});
