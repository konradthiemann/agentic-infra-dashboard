import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/repos",
}));

const { Nav } = await import("./Nav");

describe("Nav", () => {
  it("links to all five sections", () => {
    render(<Nav generatedAt={null} />);

    expect(screen.getByRole("link", { name: /übersicht/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /repos/i })).toHaveAttribute("href", "/repos");
    expect(screen.getByRole("link", { name: /agents.*skills/i })).toHaveAttribute(
      "href",
      "/agents-skills",
    );
    expect(screen.getByRole("link", { name: /workflows/i })).toHaveAttribute("href", "/workflows");
    expect(screen.getByRole("link", { name: /monitoring/i })).toHaveAttribute("href", "/monitoring");
  });

  it("marks the current page's link as active", () => {
    render(<Nav generatedAt={null} />);

    expect(screen.getByRole("link", { name: /repos/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /übersicht/i })).not.toHaveAttribute("aria-current");
  });

  it("shows the snapshot generation time when available", () => {
    render(<Nav generatedAt="2026-08-27T08:17:56.148Z" />);
    expect(screen.getByText(/aktualisiert/i)).toBeInTheDocument();
  });

  it("shows a neutral hint when there is no snapshot yet", () => {
    render(<Nav generatedAt={null} />);
    expect(screen.getByText(/noch kein snapshot/i)).toBeInTheDocument();
  });
});
