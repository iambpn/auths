import { JWT_TOKEN, RESET_TOKEN } from "./config";

export const setToken = (token: string) => {
  localStorage.setItem(JWT_TOKEN, token);
};

export const getToken = () => {
  return localStorage.getItem(JWT_TOKEN) ?? "";
};

export const setResetToken = (token: string, expiresAt: string) => {
  localStorage.setItem(
    RESET_TOKEN,
    JSON.stringify({
      token,
      expiresAt,
    })
  );
};

export const getResetToken = (): { token?: string; expiresAt?: string } => {
  return JSON.parse(localStorage.getItem(RESET_TOKEN) ?? "{}");
};
