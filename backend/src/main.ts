import express, { type Express } from "express";
import * as path from "path";
import { migrateDB } from "./schema/drizzle-migrate";
import { instantiateDB } from "./schema/kysley-instance";

const FRONTEND_PATH = path.join(__dirname, "..", "public", "frontend", "build");

export function authsInit(app: Express) {
  // Migrate db
  migrateDB(process.env.AUTHS_DB_URI);

  // Create DB Instance
  instantiateDB(process.env.AUTHS_DB_URI);

  app.get("/auths/api", (req, res) => {
    res.send("Hello world api");
  });

  // server prod frontend build
  app.use("/auths", express.static(FRONTEND_PATH));

  // serve prod index.html in * path
  app.get("/auths/*", (req, res) => {
    return res.sendFile(path.join(FRONTEND_PATH, "index.html"));
  });
}
