import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

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
          target: "http://localhost:8080/auths", // proxying and rewriting path with /api to /auths/api in dev
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
