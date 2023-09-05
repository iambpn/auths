import crypto from "crypto";

export function getRandomKey(bytes: number = 64) {
  return crypto.randomBytes(bytes).toString("hex");
}
