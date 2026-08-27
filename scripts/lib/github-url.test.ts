import { describe, it, expect } from "vitest";
import { toGithubUrl, slugFromGithubUrl } from "./github-url.ts";

describe("toGithubUrl", () => {
  it("converts an SSH remote to an https URL", () => {
    expect(toGithubUrl("git@github.com:konradthiemann/Doewe.git")).toBe(
      "https://github.com/konradthiemann/Doewe",
    );
  });

  it("normalizes an https remote by stripping .git", () => {
    expect(toGithubUrl("https://github.com/konradthiemann/Doewe.git")).toBe(
      "https://github.com/konradthiemann/Doewe",
    );
  });

  it("returns null for a non-GitHub remote", () => {
    expect(toGithubUrl("git@gitlab.com:someone/repo.git")).toBeNull();
  });

  it("returns null when there is no remote", () => {
    expect(toGithubUrl(null)).toBeNull();
  });
});

describe("slugFromGithubUrl", () => {
  it("extracts owner/repo from a GitHub URL", () => {
    expect(slugFromGithubUrl("https://github.com/konradthiemann/Doewe")).toBe(
      "konradthiemann/Doewe",
    );
  });

  it("returns null for a non-matching URL", () => {
    expect(slugFromGithubUrl("https://example.com/foo")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(slugFromGithubUrl(null)).toBeNull();
  });
});
