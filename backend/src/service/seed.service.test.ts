import { db } from "../schema/__mocks__/drizzle-migrate";
import { createHash } from "crypto";
import { seedFilePermissionCallback, seedFilePermission, seedSuperAdminRole, seedSuperAdminUser } from "./seed.service";
import { PermissionSchema, PermissionSeedSchema, RolesSchema, UserSchema } from "../schema/drizzle-schema";
import { eq } from "drizzle-orm";
import { config } from "../utils/config/app-config";

//  mocking drizzle instance using manual mocking
jest.mock("../schema/drizzle-migrate");

const jsonData = {
  permission: [
    { name: "create", slug: "create" },
    { name: "read", slug: "read" },
    { name: "update", slug: "update" },
    { name: "delete", slug: "delete" },
  ],
};

describe("Testing Seed Permission service", () => {
  describe("Testing seed file permission function", () => {
    it("Should return early if filePath is empty.", async () => {
      const returnVal = await seedFilePermission();
      expect(returnVal).toBe(false);
    });

    it("Should throw error if file extension is not JSON", async () => {
      try {
        await seedFilePermission("file");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe("Testing seed file permission callback function", () => {
    it("Should throw error if error params is not empty", async () => {
      try {
        await seedFilePermissionCallback(Error("Error test"), "");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("Should return early if computed hash and existing hash is matched", async () => {
      const stringData = JSON.stringify(jsonData);
      const hash = createHash("sha256").update(stringData).digest("hex");

      await db.insert(PermissionSeedSchema).values({
        createdAt: new Date(),
        hash: hash,
      });

      const rtnValue = await seedFilePermissionCallback(null, stringData);
      expect(rtnValue).toBe(false);
    });

    it("Should insert permission according to params", async () => {
      await seedFilePermissionCallback(null, JSON.stringify(jsonData));
      const permissions = await db.select().from(PermissionSchema);

      expect(jsonData.permission.length).toEqual(permissions.length);

      jsonData.permission.forEach((perm, idx) => {
        const found = permissions.find((item) => item.slug === perm.slug);
        expect(found).toBeDefined();
      });
    });

    it("Should delete permission according to params", async () => {
      // seed all permission
      await seedFilePermissionCallback(null, JSON.stringify(jsonData));

      //  remove one permission
      const [removePerm, ...rest] = jsonData.permission;
      const newJsonData = { permission: rest };

      // seed removed permission
      await seedFilePermissionCallback(null, JSON.stringify(newJsonData));

      //  verify if permission is removed
      const [removePermission] = await db.select().from(PermissionSchema).where(eq(PermissionSchema.slug, removePerm.slug));

      expect(removePermission).toBeUndefined();

      //  get all permissions
      const permissions = await db.select().from(PermissionSchema);

      // check length
      expect(permissions.length).toEqual(newJsonData.permission.length);

      //  verify permissions
      newJsonData.permission.forEach((perm, idx) => {
        const found = permissions.find((item) => item.slug === perm.slug);
        expect(found).toBeDefined();
      });
    });

    it("Should update permission according to params slug", async () => {
      // seed all permission
      await seedFilePermissionCallback(null, JSON.stringify(jsonData));

      //  update permission
      const [perm, ...rest] = jsonData.permission;
      perm.name = "newPermName";

      const newPerm: { name: string; slug: string } = {
        name: "updatedPerm",
        slug: "updatedPerm",
      };

      // updated perm: update one perm and added one new perm
      const newJsonData = { permission: [...rest, newPerm, perm] };

      // seed removed permission
      await seedFilePermissionCallback(null, JSON.stringify(newJsonData));

      const [updatedPerm] = await db.select().from(PermissionSchema).where(eq(PermissionSchema.slug, perm.slug));
      // updated permission
      expect(updatedPerm.name).toEqual(perm.name);
      expect(updatedPerm.slug).toEqual(perm.slug);

      const [insertedNewPerm] = await db.select().from(PermissionSchema).where(eq(PermissionSchema.slug, newPerm.slug));
      // inserted permission
      expect(insertedNewPerm.name).toEqual(newPerm.name);
      expect(insertedNewPerm.slug).toEqual(newPerm.slug);

      //  get all permissions
      const permissions = await db.select().from(PermissionSchema);

      // check length
      expect(permissions.length).toEqual(newJsonData.permission.length);

      //  verify permissions
      newJsonData.permission.forEach((perm, idx) => {
        const found = permissions.find((item) => item.slug === perm.slug);
        expect(found).toBeDefined();
      });
    });
  });

  describe("seed super admin user and super admin role", () => {
    it("Should seed super admin role on initial start up", async () => {
      await seedSuperAdminRole();
      let superAdminRoles = await db.select().from(RolesSchema).where(eq(RolesSchema.slug, config.superAdminSlug));

      expect(superAdminRoles).toBeDefined();
      expect(superAdminRoles.length).toEqual(1);
      expect(superAdminRoles[0].slug).toEqual(config.superAdminSlug);

      await seedSuperAdminRole();
      superAdminRoles = await db.select().from(RolesSchema).where(eq(RolesSchema.slug, config.superAdminSlug));
      expect(superAdminRoles.length).toEqual(1);
    });

    it("Should seed super admin user on initial start up", async () => {
      await seedSuperAdminRole();
      await seedSuperAdminUser();

      let [superAdminRole] = await db.select().from(RolesSchema).where(eq(RolesSchema.slug, config.superAdminSlug)).limit(1);

      let superAdminUsers = await db.select().from(UserSchema).where(eq(UserSchema.role, superAdminRole.uuid));

      expect(superAdminUsers).toBeDefined();
      expect(superAdminUsers.length).toEqual(1);
      expect(superAdminUsers[0].role).toEqual(superAdminRole.uuid);

      await seedSuperAdminUser();
      superAdminUsers = await db.select().from(UserSchema).where(eq(UserSchema.role, superAdminRole.uuid));
      expect(superAdminUsers.length).toEqual(1);
    });
  });
});
