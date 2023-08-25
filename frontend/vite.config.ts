import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../backend/public/frontend/build",
  },
  server: {
    proxy: {
      // Conditionally set up proxy only during development
      ...(process.env.NODE_ENV === "development" && {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      }),
    },
  },
});
