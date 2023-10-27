import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  timeout: 1000,
  headers: {
    Authorization: "Bearer " + localStorage.getItem("token") || "",
  },
});
