import fs from "node:fs/promises";
import path from "node:path";
import { AGENTS_DIR } from "./paths.ts";
import { parseFrontmatter } from "./frontmatter.ts";
import { agentExamples } from "../content/agent-examples.ts";
import type { AgentInfo } from "../../src/lib/snapshot-schema.ts";

export async function scanAgents(): Promise<AgentInfo[]> {
  let files: string[];
  try {
    files = (await fs.readdir(AGENTS_DIR)).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  const agents: AgentInfo[] = [];
  for (const file of files.sort()) {
    const raw = await fs.readFile(path.join(AGENTS_DIR, file), "utf-8");
    const { frontmatter } = parseFrontmatter(raw);
    const name = frontmatter.name ?? path.basename(file, ".md");
    agents.push({
      name,
      description: frontmatter.description ?? "",
      tools: (frontmatter.tools ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      model: frontmatter.model ?? null,
      example: agentExamples[name] ?? null,
    });
  }
  return agents;
}
