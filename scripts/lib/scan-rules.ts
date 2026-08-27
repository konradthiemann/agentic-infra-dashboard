import fs from "node:fs/promises";
import path from "node:path";
import { WORKSPACE_RULES_DIR } from "./paths.ts";
import { summarizeRuleMarkdown } from "./frontmatter.ts";
import type { RuleInfo } from "../../src/lib/snapshot-schema.ts";

export async function scanRules(): Promise<RuleInfo[]> {
  let files: string[];
  try {
    files = (await fs.readdir(WORKSPACE_RULES_DIR)).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  const rules: RuleInfo[] = [];
  for (const file of files.sort()) {
    const raw = await fs.readFile(path.join(WORKSPACE_RULES_DIR, file), "utf-8");
    const slug = path.basename(file, ".md");
    const { title, summary } = summarizeRuleMarkdown(raw);
    rules.push({ slug, title: title ?? slug, summary });
  }
  return rules;
}
