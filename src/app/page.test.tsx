import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import fixtureSnapshot from "../../fixtures/snapshot.sample.json";
import type { Snapshot } from "@/lib/snapshot-schema";

const { getSnapshot } = vi.hoisted(() => ({ getSnapshot: vi.fn() }));
vi.mock("@/lib/get-snapshot", () => ({ getSnapshot }));

const { default: Home } = await import("./page");

describe("Home (Overview)", () => {
  it("shows workspace counts and links to every section when a snapshot is available", async () => {
    getSnapshot.mockResolvedValue(fixtureSnapshot as Snapshot);
    render(await Home());

    expect(screen.getByText(String(fixtureSnapshot.workspace.repoCount))).toBeInTheDocument();
    expect(screen.getByText(String(fixtureSnapshot.workspace.agentCount))).toBeInTheDocument();
    expect(screen.getByText(String(fixtureSnapshot.workspace.skillCount))).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /repos/i })).toHaveAttribute("href", "/repos");
    expect(screen.getByRole("link", { name: /agents.*skills/i })).toHaveAttribute(
      "href",
      "/agents-skills",
    );
    expect(screen.getByRole("link", { name: /workflows/i })).toHaveAttribute("href", "/workflows");
    expect(screen.getByRole("link", { name: /monitoring/i })).toHaveAttribute("href", "/monitoring");
  });

  it("shows the calm fallback message when there is no snapshot", async () => {
    getSnapshot.mockResolvedValue(null);
    render(await Home());

    expect(screen.getByText(/snapshot noch nicht verfügbar/i)).toBeInTheDocument();
  });
});
