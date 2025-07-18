import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { getBuildInfo } from "./scripts/get-build-info.js";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const buildInfo = getBuildInfo(mode === 'production' ? 'production' : 'development');
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ["lucide-react"],
    },
    server: {
      hmr: {
        overlay: true,
      },
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    define: {
      'window.__BUILD_INFO__': JSON.stringify(buildInfo)
    }
  };
});