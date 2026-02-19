import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/children": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/videos": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/parent": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
})