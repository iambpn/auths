import axios from "axios";

export const axiosInstance = axios.create({
  /**
   * this wont be changed on both prod and dev env because of prefix on final build and proxy on dev. see vite.config.ts
   */
  baseURL: "/api",
  timeout: 1000,
  headers: {
    Authorization: "Bearer " + localStorage.getItem("token") || "",
  },
});
