export interface ParsedMarkdown {
  frontmatter: Record<string, string>;
  body: string;
}

/**
 * Minimal frontmatter parser for SKILL.md/agent files: flat `key: value`
 * pairs between `---` delimiters, plus `>`/`|` block scalars (installed
 * plugin skills like use-railway use them for long descriptions). No nested
 * structures — intentionally not a full YAML parser.
 */
export function parseFrontmatter(raw: string): ParsedMarkdown {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }
  const [, fmBlock, body] = match;
  const frontmatter: Record<string, string> = {};
  const lines = fmBlock.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const lineMatch = lines[i].match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!lineMatch) continue;
    const [, key, value] = lineMatch;
    const blockScalar = value.trim().match(/^([>|])[+-]?$/);
    if (!blockScalar) {
      frontmatter[key] = value.trim();
      continue;
    }
    const blockLines: string[] = [];
    while (i + 1 < lines.length && (lines[i + 1].trim() === "" || /^\s/.test(lines[i + 1]))) {
      blockLines.push(lines[++i].trim());
    }
    frontmatter[key] =
      blockScalar[1] === ">"
        ? blockLines.filter(Boolean).join(" ")
        : blockLines.join("\n").trim();
  }
  return { frontmatter, body: body.trim() };
}

/** First `# Heading` in a markdown body, or null. */
export function firstHeading(body: string): string | null {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/** Strips the inline markdown our own docs use (bold/italic/code spans), keeping the text. */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}

/** First non-empty paragraph after the first heading, as a plain-text summary. */
export function firstParagraph(body: string): string {
  const withoutHeading = body.replace(/^#\s+.+$/m, "").trim();
  const paragraph = withoutHeading.split(/\n\s*\n/)[0] ?? "";
  return stripInlineMarkdown(paragraph.replace(/\s+/g, " ").trim());
}

/**
 * Summarizes a rule markdown file for display: title from the first
 * heading, summary from the frontmatter `description` when present
 * (several of our rule files have one), otherwise the first paragraph of
 * the body. Always strips frontmatter first — using firstParagraph on the
 * raw file would otherwise pick up the frontmatter block itself as the
 * "paragraph" when a heading follows it.
 */
export function summarizeRuleMarkdown(raw: string): { title: string | null; summary: string } {
  const { frontmatter, body } = parseFrontmatter(raw);
  return {
    title: firstHeading(body),
    summary: frontmatter.description ?? firstParagraph(body),
  };
}
