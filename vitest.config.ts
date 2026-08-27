import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Exclude nested Claude Code agent worktrees (isolation: "worktree" checks
    // out a full copy of this repo under .claude/worktrees/) so a
    // backgrounded agent's in-progress files never get picked up here.
    exclude: ["**/node_modules/**", "**/.claude/worktrees/**", "**/dist/**"],
  },
});
