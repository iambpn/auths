import { eq } from "drizzle-orm";
import * as uuid from "uuid";
import { db } from "../dbSchema/__mocks__/drizzle-migrate";
import { schema } from "../dbSchema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { HttpError } from "../utils/helper/httpError";
import {
  assignRolesToPermission,
  createPermission,
  deletePermission,
  getAllPermission,
  getPermissionById,
  getRolesByPermission,
  updatePermission,
} from "./permission.service";

//  mocking drizzle instance using manual mocking
jest.mock("../dbSchema/drizzle-migrate");

const UserRole = { uuid: uuid.v4(), slug: "test_role" };
const DefaultPermission = { uuid: uuid.v4(), slug: "default_permission" };

async function insertRole(role: typeof UserRole) {
  await db.insert(schema.RolesSchema).values({
    name: role.slug,
    slug: role.slug,
    uuid: role.uuid,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function insertPermission(permission: typeof DefaultPermission) {
  await db.insert(schema.PermissionSchema).values({
    name: permission.slug,
    slug: permission.slug,
    uuid: permission.uuid,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("Permission Service Testing", () => {
  describe("Get All Permission", () => {
    it("Should return all permissions following pagination", async () => {
      await insertPermission(DefaultPermission);
      await insertPermission({
        uuid: uuid.v4(),
        slug: "test_permission",
      });

      const result = await db.select().from(schema.PermissionSchema);
      expect(result.length).toBe(2);

      const permissions = await getAllPermission({
        limit: 1,
        skip: 0,
      });

      expect(permissions.permissions.length).toBe(1);
    });

    it("Should return all permission following pagination's skip parameter", async () => {
      await insertPermission(DefaultPermission);
      await insertPermission({
        uuid: uuid.v4(),
        slug: "test_permission",
      });

      const result = await db.select().from(schema.PermissionSchema);
      expect(result.length).toBe(2);

      const permissions = await getAllPermission({
        limit: 1,
        skip: 1,
      });

      expect(permissions.permissions.length).toBe(1);
      expect(permissions.permissions[0].slug).toBe("test_permission");
    });

    it("Should return all permission following pagination and search keyword", async () => {
      await insertPermission(DefaultPermission);
      await insertPermission({
        uuid: uuid.v4(),
        slug: "test_permission",
      });

      const result = await db.select().from(schema.PermissionSchema);
      expect(result.length).toBe(2);

      const allRoles = await getAllPermission({ limit: 1, skip: 0 }, "test");

      expect(allRoles.permissions.length).toBe(1);
      expect(allRoles.permissions[0].slug).toBe("test_permission");
    });
  });

  describe("Get Roles By Permission", () => {
    it("Should return all roles following permission's uuid", async () => {
      const superAdminId = uuid.v4();
      await insertRole(UserRole);
      await insertRole({
        uuid: superAdminId,
        slug: config.superAdminSlug,
      });

      await insertPermission(DefaultPermission);

      await assignRolesToPermission(DefaultPermission.uuid, { roles: [UserRole.uuid, superAdminId] });

      const rolesPermission = await getRolesByPermission(DefaultPermission.uuid, { limit: 1, skip: 0 });

      expect(rolesPermission.roles.length).toBe(1);
      expect(rolesPermission.roles[0].name).toBe(UserRole.slug);
    });
  });

  describe("Get Permission By Id", () => {
    it("Should return permission by id", async () => {
      await insertPermission(DefaultPermission);
      const permission = await getPermissionById(DefaultPermission.uuid);
      expect(permission.slug).toEqual(DefaultPermission.slug);
    });

    it("should throw 404 error if permission is not found", async () => {
      try {
        expect(await getPermissionById(uuid.v4())).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(404);
      }
    });
  });

  describe("Create Permission", () => {
    it("Should create permission", async () => {
      const permission = await createPermission({
        slug: DefaultPermission.slug,
        name: DefaultPermission.slug,
      });
      expect(permission.slug).toEqual(DefaultPermission.slug);
    });

    it("Should throw 409 error if permission already exists", async () => {
      await insertPermission(DefaultPermission);

      try {
        expect(
          await createPermission({
            slug: DefaultPermission.slug,
            name: DefaultPermission.slug,
          })
        ).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(409);
      }
    });
  });

  describe("Update Permission", () => {
    it("Should update permission", async () => {
      const permission = await createPermission({
        name: DefaultPermission.slug,
        slug: DefaultPermission.slug,
      });

      const newPermission = {
        name: "updated_permission",
        slug: "updated_permission",
      };
      const updatedPermission = await updatePermission(permission.uuid, newPermission);

      expect(updatedPermission.slug).toEqual(newPermission.slug);
    });

    it("Should throw 404 error if permission not found", async () => {
      try {
        expect(
          await updatePermission(uuid.v4(), {
            name: DefaultPermission.slug,
            slug: DefaultPermission.slug,
          })
        ).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(404);
      }
    });

    it("Should throw 409 error if permission slug is already exist", async () => {
      try {
        await insertPermission(DefaultPermission);
        await insertPermission({
          slug: "test_permission",
          uuid: uuid.v4(),
        });

        expect(
          await updatePermission(DefaultPermission.uuid, {
            name: DefaultPermission.slug,
            slug: "test_permission",
          })
        ).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }

        expect(error.statusCode).toBe(409);
      }
    });
  });

  describe("Delete Permission", () => {
    it("Should throw 404 error on non-existent permission", async () => {
      try {
        expect(await deletePermission(uuid.v4())).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(404);
      }
    });

    it("Should not allow to delete permission that are in use", async () => {
      await insertPermission(DefaultPermission);
      await insertRole(UserRole);

      await assignRolesToPermission(DefaultPermission.uuid, {
        roles: [UserRole.uuid],
      });

      try {
        expect(await deletePermission(DefaultPermission.uuid)).toThrowError();
      } catch (error) {
        if (!(error instanceof HttpError)) {
          throw error;
        }
        expect(error.statusCode).toBe(400);
      }
    });

    it("Should delete Permission", async () => {
      await insertPermission(DefaultPermission);

      const result = await deletePermission(DefaultPermission.uuid);

      expect(result).toBeDefined();

      const [permission] = await db.select().from(schema.PermissionSchema).where(eq(schema.PermissionSchema.uuid, DefaultPermission.uuid)).limit(1);

      expect(permission).not.toBeDefined();
    });
  });

  describe("Assign Roles to Permission", () => {
    it("Should assign role to permission", async () => {
      await insertPermission(DefaultPermission);
      await insertRole(UserRole);

      await assignRolesToPermission(DefaultPermission.uuid, {
        roles: [UserRole.uuid],
      });

      let [linkedRoles] = await db
        .select()
        .from(schema.RolesPermissionsSchema)
        .where(eq(schema.RolesPermissionsSchema.permissionUuid, DefaultPermission.uuid))
        .limit(1);

      expect(linkedRoles.roleUuid).toBe(UserRole.uuid);
    });

    it("Should remove previous permission and add new permission to role", async () => {
      const superAdminId = uuid.v4();
      await insertRole(UserRole);
      await insertRole({
        uuid: superAdminId,
        slug: config.superAdminSlug,
      });

      await insertPermission(DefaultPermission);

      // assign role
      await assignRolesToPermission(DefaultPermission.uuid, { roles: [superAdminId] });

      const [rolesPermission] = await db
        .select()
        .from(schema.RolesPermissionsSchema)
        .where(eq(schema.RolesPermissionsSchema.permissionUuid, DefaultPermission.uuid))
        .limit(1);

      expect(rolesPermission.roleUuid).toEqual(superAdminId);

      //  assign new role and remove old role
      await assignRolesToPermission(DefaultPermission.uuid, { roles: [UserRole.uuid] });

      const result = await getRolesByPermission(DefaultPermission.uuid, { limit: 2, skip: 0 });

      expect(result.roles.length).toBe(1);
      expect(result.roles[0].name).toBe(UserRole.slug);
    });
  });
});
