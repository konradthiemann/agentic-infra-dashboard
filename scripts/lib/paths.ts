import os from "node:os";
import path from "node:path";

export const HOME = os.homedir();
export const GLOBAL_CLAUDE_DIR = path.join(HOME, ".claude");
export const WORKSPACE_ROOT = path.join(HOME, "Softwareentwicklung");
export const WORKSPACE_RULES_DIR = path.join(WORKSPACE_ROOT, ".claude", "rules");
export const AGENTS_DIR = path.join(GLOBAL_CLAUDE_DIR, "agents");
export const SKILLS_DIR = path.join(GLOBAL_CLAUDE_DIR, "skills");
export const HOOKS_DIR = path.join(GLOBAL_CLAUDE_DIR, "hooks");
export const SETTINGS_FILE = path.join(GLOBAL_CLAUDE_DIR, "settings.json");
export const TDD_GATE_LOG = path.join(GLOBAL_CLAUDE_DIR, "logs", "agentic-events.jsonl");

/** Directories under WORKSPACE_ROOT that are never project repos. */
export const NON_REPO_DIRS = new Set([".claude", ".worktrees", "docs", "node_modules", ".git"]);
