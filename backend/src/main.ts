import express from "express";
import * as path from "path";

const FRONTEND_PATH = path.join(__dirname, "..", "public", "frontend", "build");

const app = express();

app.get("/api", (req, res) => {
  res.send("Hello world api");
});

// server prod frontend build
app.use(express.static(FRONTEND_PATH));

// serve prod index.html in * path
app.get("*", (req, res) => {
  return res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

app.listen(8080, () => {
  console.log("listening on port 8080");
});
