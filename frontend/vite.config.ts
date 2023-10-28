import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  ...(process.env.NODE_ENV === "production" && {
    base: "/auths", // prepending /auths for api calls including fetching resources
  }),
  build: {
    outDir: "../backend/public/frontend/build",
  },
  server: {
    proxy: {
      // Conditionally set up proxy only during development
      ...(process.env.NODE_ENV === "development" && {
        "/api": {
          target: process.env.DEV_BASE_URL, // proxying and rewriting path with fe_base_api/api/... to env_base_api/api/... in dev env
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      }),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
