import { JWT_TOKEN } from "./config";

export const setToken = (token: string) => {
  localStorage.setItem(JWT_TOKEN, token);
};

export const getToken = () => {
  return localStorage.getItem(JWT_TOKEN) ?? "";
};
