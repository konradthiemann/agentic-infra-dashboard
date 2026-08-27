import { describe, it, expect } from "vitest";
import { parseFrontmatter, firstHeading, firstParagraph } from "./frontmatter.ts";

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
});
