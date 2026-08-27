import fs from "node:fs/promises";
import path from "node:path";
import { SETTINGS_FILE } from "./paths.ts";
import { hookPurposes } from "../content/hook-purposes.ts";
import type { HookInfo } from "../../src/lib/snapshot-schema.ts";

interface HookEntry {
  matcher?: string;
  hooks: Array<{ command: string }>;
}
type HookSettings = Record<string, HookEntry[]>;

export async function scanHooks(): Promise<HookInfo[]> {
  let settings: { hooks?: HookSettings };
  try {
    settings = JSON.parse(await fs.readFile(SETTINGS_FILE, "utf-8"));
  } catch {
    return [];
  }

  const byFile = new Map<string, Set<string>>();
  for (const [event, entries] of Object.entries(settings.hooks ?? {})) {
    for (const entry of entries) {
      for (const hook of entry.hooks) {
        const match = hook.command.match(/([a-zA-Z0-9_-]+\.sh)/);
        if (!match) continue;
        const file = match[1];
        const label = entry.matcher ? `${event}:${entry.matcher}` : event;
        if (!byFile.has(file)) byFile.set(file, new Set());
        byFile.get(file)!.add(label);
      }
    }
  }

  const hooks: HookInfo[] = [];
  for (const [file, events] of [...byFile.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    hooks.push({
      name: path.basename(file, ".sh"),
      file,
      events: [...events],
      purpose: hookPurposes[file] ?? "Kein kuratierter Zweck hinterlegt.",
    });
  }
  return hooks;
}
