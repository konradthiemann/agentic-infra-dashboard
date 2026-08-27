import fs from "node:fs/promises";
import path from "node:path";
import { SKILLS_DIR } from "./paths.ts";
import { parseFrontmatter } from "./frontmatter.ts";
import { skillExamples } from "../content/skill-examples.ts";
import type { SkillInfo } from "../../src/lib/snapshot-schema.ts";

export async function scanSkills(): Promise<SkillInfo[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(SKILLS_DIR);
  } catch {
    return [];
  }

  const skills: SkillInfo[] = [];
  for (const entry of entries.sort()) {
    const skillFile = path.join(SKILLS_DIR, entry, "SKILL.md");
    let raw: string;
    try {
      raw = await fs.readFile(skillFile, "utf-8");
    } catch {
      continue;
    }
    const { frontmatter } = parseFrontmatter(raw);
    const name = frontmatter.name ?? entry;
    const description = frontmatter.description ?? "";
    const triggerMatch = description.match(/Nutzen,?\s*(?:bei\s+)?(.+)$/);
    skills.push({
      name,
      description,
      triggerHint: triggerMatch ? triggerMatch[1].trim() : null,
      example: skillExamples[name] ?? null,
    });
  }
  return skills;
}
