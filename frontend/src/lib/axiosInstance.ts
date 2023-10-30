import axios from "axios";
import { getToken } from "./localstorage";

const axiosInstance = axios.create({
  /**
   * this wont be changed on both prod and dev env because of prefix on final build and proxy on dev. see vite.config.ts
   */
  baseURL: "/api",
  timeout: 1000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers["Authorization"] = "bearer " + getToken();
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

export { axiosInstance };
