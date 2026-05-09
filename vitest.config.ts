import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    include: ["app/**/*.test.ts"],
    environment: "node"
  }
});
