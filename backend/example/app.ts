import express, { type NextFunction, type Request, type Response } from "express";
import * as path from "path";
import { authsInit, initiateForgotPassword, isAuthenticated, login, signup } from "../src/main";

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
  res.json({ msg: req.currentUser?.email });
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(error, "MOCK ERROR HANDLER");
  return res.status(500).json({ message: error.message });
});

app.listen(8080, () => {
  console.log("listening on port 8080");
});
