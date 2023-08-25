import express from "express";
import { authsInit } from "../src/main";

const app = express();

authsInit(app);

app.listen(8080, () => {
  console.log("listening on port 8080");
});
