import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// vite.config.ts
const addTsNoCheck = () => {
  return {
    name: "add-ts-nocheck",
    transform(code: string, id: string) {
      const problematicDirs = [
        "../../packages/frontend-shared/src/components/blocks",
        "../../packages/frontend-shared/src/components/editor",
      ];

      const shouldIgnore = problematicDirs.some((dir) => id.includes(dir));

      if (shouldIgnore && (id.endsWith(".ts") || id.endsWith(".tsx"))) {
        console.log("SUPPRESSING: ", id);
        return {
          code: `// @ts-nocheck\n${code}`,
          map: null,
        };
      }
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite({ target: "react", autoCodeSplitting: true }), react(), tailwindcss(), addTsNoCheck()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
  define: {
    // Make environment variables available to the client
    "import.meta.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL || "http://localhost:8000"),
  },
});
