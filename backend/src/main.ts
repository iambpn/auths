import express, { type Express } from "express";
import * as path from "path";

const FRONTEND_PATH = path.join(__dirname, "..", "public", "frontend", "build");

export function authsInit(app: Express) {
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
