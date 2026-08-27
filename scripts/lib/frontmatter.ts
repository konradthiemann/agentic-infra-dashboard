export interface ParsedMarkdown {
  frontmatter: Record<string, string>;
  body: string;
}

/**
 * Minimal frontmatter parser for our own SKILL.md/agent files: flat
 * `key: value` pairs between `---` delimiters, no nested structures.
 * Intentionally not a full YAML parser — these files are hand-written and
 * simple by convention (see .claude/rules).
 */
export function parseFrontmatter(raw: string): ParsedMarkdown {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }
  const [, fmBlock, body] = match;
  const frontmatter: Record<string, string> = {};
  for (const line of fmBlock.split("\n")) {
    const lineMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!lineMatch) continue;
    const [, key, value] = lineMatch;
    frontmatter[key] = value.trim();
  }
  return { frontmatter, body: body.trim() };
}

/** First `# Heading` in a markdown body, or null. */
export function firstHeading(body: string): string | null {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/** First non-empty paragraph after the first heading, as a plain-text summary. */
export function firstParagraph(body: string): string {
  const withoutHeading = body.replace(/^#\s+.+$/m, "").trim();
  const paragraph = withoutHeading.split(/\n\s*\n/)[0] ?? "";
  return paragraph.replace(/\s+/g, " ").trim();
}
