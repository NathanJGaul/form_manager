import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import circularDependency from "vite-plugin-circular-dependency";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile({
      // Prevent removal of unused CSS
      removeViteModuleLoader: false,
    }),
    circularDependency({
      outputFilePath: "./circular-deps.txt",
    }),
  ],
  build: {
    // Enable source maps for better debugging
    sourcemap: true,
    // Use terser for better minification control
    minify: "terser",
    // Use a more compatible target that supports BigInt
    target: "es2020",
    assetsInlineLimit: 100000000, // 100MB - inline everything
    cssCodeSplit: false,
    terserOptions: {
      compress: {
        // Prevent unsafe optimizations
        unsafe: false,
        unsafe_comps: false,
        unsafe_Function: false,
        unsafe_math: false,
        unsafe_symbols: false,
        unsafe_methods: false,
        unsafe_proto: false,
        unsafe_regexp: false,
        unsafe_undefined: false,
        // Keep initialization order
        sequences: false,
        // Prevent function inlining that might cause issues
        inline: 1,
      },
      mangle: {
        // Keep function names for better debugging
        keep_fnames: true,
      },
      format: {
        // Preserve some formatting for readability
        beautify: false,
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
        // Ensure proper module format
        format: "iife",
        // Prevent variable name conflicts
        intro: "const global = window;",
      },
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
