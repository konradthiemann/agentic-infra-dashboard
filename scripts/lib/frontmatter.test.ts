import { describe, it, expect } from "vitest";
import { parseFrontmatter, firstHeading, firstParagraph, summarizeRuleMarkdown } from "./frontmatter.ts";

describe("parseFrontmatter", () => {
  it("extracts flat key/value pairs and the body", () => {
    const raw = ["---", "name: commit", "description: Does a thing.", "---", "", "# Body", "text"].join(
      "\n",
    );
    const { frontmatter, body } = parseFrontmatter(raw);
    expect(frontmatter).toEqual({ name: "commit", description: "Does a thing." });
    expect(body).toBe("# Body\ntext");
  });

  it("returns an empty frontmatter object when there is no delimiter block", () => {
    const raw = "# Just a heading\nsome text";
    const { frontmatter, body } = parseFrontmatter(raw);
    expect(frontmatter).toEqual({});
    expect(body).toBe(raw);
  });

  it("keeps a literal colon inside the value", () => {
    const raw = ["---", "description: Nutzen bei: X, Y oder Z.", "---", "body"].join("\n");
    const { frontmatter } = parseFrontmatter(raw);
    expect(frontmatter.description).toBe("Nutzen bei: X, Y oder Z.");
  });
});

describe("firstHeading", () => {
  it("finds the first level-1 heading", () => {
    expect(firstHeading("intro\n# Title\nrest")).toBe("Title");
  });

  it("returns null when there is no heading", () => {
    expect(firstHeading("just text")).toBeNull();
  });
});

describe("firstParagraph", () => {
  it("returns the first paragraph after the heading, collapsed to one line", () => {
    const body = "# Title\n\nFirst line\nsecond line.\n\nSecond paragraph.";
    expect(firstParagraph(body)).toBe("First line second line.");
  });

  it("strips inline markdown emphasis and code spans so it reads as plain text", () => {
    const body = "# Title\n\nTests kommen **vor** dem Code, siehe `CLAUDE.md` für Details.";
    expect(firstParagraph(body)).toBe("Tests kommen vor dem Code, siehe CLAUDE.md für Details.");
  });
});

describe("summarizeRuleMarkdown", () => {
  it("uses the frontmatter description as summary, not the raw frontmatter block", () => {
    // Real shape of e.g. .claude/rules/code-style.md — description in
    // frontmatter, heading + body below it.
    const raw = [
      "---",
      "description: Allgemeine, sprachübergreifende Code-Konventionen.",
      "---",
      "# Code-Style (polyglott)",
      "",
      "## Übergreifend",
      "- Code, Bezeichner, Code-Kommentare: **Englisch**.",
    ].join("\n");

    const { title, summary } = summarizeRuleMarkdown(raw);

    expect(title).toBe("Code-Style (polyglott)");
    expect(summary).toBe("Allgemeine, sprachübergreifende Code-Konventionen.");
    expect(summary).not.toContain("---");
    expect(summary).not.toContain("description:");
  });

  it("falls back to the first paragraph when there is no frontmatter", () => {
    const raw = "# Test-Driven Development\n\nRot-Grün-Refactor ist Pflicht für neues Verhalten.";

    const { title, summary } = summarizeRuleMarkdown(raw);

    expect(title).toBe("Test-Driven Development");
    expect(summary).toBe("Rot-Grün-Refactor ist Pflicht für neues Verhalten.");
  });
});
