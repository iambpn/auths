import { db } from "../schema/__mocks__/drizzle-migrate";

//  mocking drizzle instance using manual mocking
jest.mock("../schema/drizzle-migrate");

describe("CMS Auth Service Testing", () => {
  describe("Login service", () => {
    it("Should issue a jwt login on correct email and password.", async () => {});

    it("Should throw 404 if user is not found", () => {});

    it("Should throw 401 error on insufficient role", () => {});

    it("Should throw 400 error on incorrect password", () => {});
  });

  describe("Validate Email", () => {
    it("Should throw 404 error on incorrect email", () => {});

    it("Should throw 400 error on missing security question", () => {});

    it("Should return success object on success", () => {});
  });

  describe("Forget Password Service", () => {
    it("Should throw 404 error on incorrect email", () => {});

    it("Should throw 400 error on security question not found", () => {});

    it("Should throw 400 error on invalid security question", () => {});

    it("Should throw 400 error on invalid security question", () => {});

    it("Should disable previous token when issuing new token", () => {});

    it("Should return token on success", () => {});
  });

  describe("Reset Password", () => {
    it("Should throw 400 error on invalid token", () => {});

    it("Should throw 404 error on token user not found", () => {});

    it("Should expire token once it is used", () => {});

    it("Should reset password on success", () => {});
  });

  describe("Set Security Question", () => {
    it("Should throw 404 error on user not found", () => {});

    it("Should 409 error on security question already added", () => {});

    it("Should add security questions", () => {});
  });
});
