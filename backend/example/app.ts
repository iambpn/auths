import dotEnv from "dotenv";
import express, { type NextFunction, type Request, type Response } from "express";
import * as path from "path";
import { authsInit, initiateForgotPassword, isAuthenticated, login, requiredPermissions, signup } from "../src/main";

dotEnv.config({ path: path.join(__dirname, "../.env") });

// adding env variable
process.env["AUTHS_DB_URI"] = path.join(__dirname, "./dev.sqlite");
process.env["AUTHS_SECRET"] = "secret_key";
process.env["AUTHS_DB_DRIVER"] = process.env.example_app_driver;

if (process.env.example_app_driver === "node-postgres") {
  process.env["AUTHS_DB_HOST"] = process.env.pg_host;
  process.env["AUTHS_DB_PORT"] = process.env.pg_port;
  process.env["AUTHS_DB_USERNAME"] = process.env.pg_user;
  process.env["AUTHS_DB_PASSWORD"] = process.env.pg_password;
  process.env["AUTHS_DB_NAME"] = process.env.pg_db;
} else if (process.env.example_app_driver === "mysql2") {
  process.env["AUTHS_DB_HOST"] = process.env.mysql_host;
  process.env["AUTHS_DB_PORT"] = process.env.mysql_port;
  process.env["AUTHS_DB_USERNAME"] = process.env.mysql_user;
  process.env["AUTHS_DB_PASSWORD"] = process.env.mysql_password;
  process.env["AUTHS_DB_NAME"] = process.env.mysql_db;
}

const app = express();
app.use(express.json());

authsInit(app, path.join(__dirname, "permission.json")).then(() => {
  app.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await signup(email, password, "superadmin");
      return res.status(201).json(result);
    } catch (error) {
      // Handling error in async handler
      next(error);
    }
  });

  app.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, token } = req.body;
      const result = await login(token, email);
      return res.status(201).json(result);
    } catch (error: unknown) {
      // Handling error in async handler
      next(error);
    }
  });

  app.post("/forgetPassword", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const resetPasswordDetails = await initiateForgotPassword(email);

      // send email or send sms

      return res.json(resetPasswordDetails);
    } catch (error: unknown) {
      next(error);
    }
  });

  app.get("/", isAuthenticated, (req, res) => {
    res.json({ msg: (req as any).currentUser?.email });
  });

  app.get("/protected", isAuthenticated, requiredPermissions(["read"]), (req, res) => {
    res.json({ msg: "protected" });
  });

  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(error, "MOCK ERROR HANDLER");
    return res.status(500).json({ message: error.message });
  });

  app.listen(8080, () => {
    console.log("listening on port 8080");
  });
});
