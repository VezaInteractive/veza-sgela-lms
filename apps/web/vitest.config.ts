import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    include: ["**/*.test.ts"],
    exclude: ["node_modules", "e2e", ".next"],
    setupFiles: ["./vitest.setup.ts"],
    // DB integration tests share one Postgres; keep files sequential to avoid cross-talk.
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
