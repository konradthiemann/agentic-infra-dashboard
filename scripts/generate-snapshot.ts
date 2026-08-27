#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { scanAgents } from "./lib/scan-agents.ts";
import { scanSkills } from "./lib/scan-skills.ts";
import { scanRules } from "./lib/scan-rules.ts";
import { scanHooks } from "./lib/scan-hooks.ts";
import { scanRepos } from "./lib/scan-repos.ts";
import { scanMonitoring } from "./lib/scan-monitoring.ts";
import { workflows } from "./content/workflows.ts";
import { snapshotSchema, type Snapshot } from "../src/lib/snapshot-schema.ts";

async function generate(): Promise<Snapshot> {
  const [repos, agents, skills, rules, hooks] = await Promise.all([
    scanRepos(),
    scanAgents(),
    scanSkills(),
    scanRules(),
    scanHooks(),
  ]);
  const monitoring = await scanMonitoring(repos);

  return {
    generatedAt: new Date().toISOString(),
    workspace: {
      repoCount: repos.length,
      agentCount: agents.length,
      skillCount: skills.length,
    },
    repos,
    agents,
    skills,
    rules,
    hooks,
    workflows,
    monitoring,
  };
}

async function main() {
  const outPath = process.argv[2];
  if (!outPath) {
    console.error("Usage: generate-snapshot.ts <output-path.json>");
    process.exit(1);
  }

  const snapshot = await generate();
  const result = snapshotSchema.safeParse(snapshot);
  if (!result.success) {
    console.error("Generated snapshot failed schema validation:");
    console.error(result.error.format());
    process.exit(1);
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(result.data, null, 2) + "\n", "utf-8");
  console.log(
    `Snapshot written to ${outPath} (${snapshot.repos.length} repos, ${snapshot.agents.length} agents, ${snapshot.skills.length} skills)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
