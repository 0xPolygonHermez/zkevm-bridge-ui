import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import checker from "vite-plugin-checker";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      fastRefresh: false,
    }),
    svgr(),
    checker({
      typescript: true,
      eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' },
    }),
  ],
  server: {
    open: true,
  },
  resolve: {
    alias: [{ find: "src", replacement: path.resolve(__dirname, "src") }],
  },
  define: {
    bridgeVersion: JSON.stringify(process.env.npm_package_version),
  },
});
