import express from "express";
import { authsInit } from "../src/main";
import * as path from "path";

// adding env variable
process.env["AUTHS_DB_URI"] = path.join(__dirname, "./dev.sqlite");

const app = express();

authsInit(app);

app.listen(8080, () => {
  console.log("listening on port 8080");
});
