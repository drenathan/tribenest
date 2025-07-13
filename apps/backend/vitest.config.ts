import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  plugins: [tsconfigPaths()],
  test: {
    exclude: ["**/node_modules/**", "**/build/**", "./src/config/config.test.ts"],
    setupFiles: ["./src/_tests/setup.ts"],
    alias: {
      "@src": new URL("./src/", import.meta.url).pathname,
    },
  },
}));
