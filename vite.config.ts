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
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("/react/")) {
              return "vendor-react"
            }
            if (id.includes("@reduxjs") || id.includes("react-redux")) {
              return "vendor-redux"
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion"
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons"
            }
            if (id.includes("socket.io-client")) {
              return "vendor-socket"
            }
            if (id.includes("algoliasearch") || id.includes("react-instantsearch")) {
              return "vendor-search"
            }
            if (id.includes("date-fns") || id.includes("react-day-picker")) {
              return "vendor-date"
            }
          }
        },
      },
    },
  },
})