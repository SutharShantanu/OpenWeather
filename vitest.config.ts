import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

export default defineConfig({
  resolve: {
    // Mirrors tsconfig "paths" (including the local date-fns shim).
    alias: [
      { find: /^@\//, replacement: fileURLToPath(new URL("./", import.meta.url)) },
      { find: /^date-fns$/, replacement: fileURLToPath(new URL("./lib/date-fns.ts", import.meta.url)) },
    ],
  },
  test: {
    // Hooks/components opt into jsdom per file with `// @vitest-environment jsdom`.
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next"],
  },
})
