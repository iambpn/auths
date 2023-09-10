import express, { type Request, type Response, type NextFunction } from "express";
import { authsInit, login, signup } from "../src/main";
import * as path from "path";

// adding env variable
process.env["AUTHS_DB_URI"] = path.join(__dirname, "./dev.sqlite");
process.env["AUTHS_SECRET"] = "secret_key";

const app = express();
app.use(express.json());

authsInit(app);

app.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await signup(email, password);
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
  } catch (error) {
    // Handling error in async handler
    next(error);
  }
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(error, "MOK ERROR HANDLER");
  return res.status(500).json({ message: error.message });
});

app.listen(8080, () => {
  console.log("listening on port 8080");
});
