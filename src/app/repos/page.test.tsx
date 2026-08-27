import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import fixtureSnapshot from "../../../fixtures/snapshot.sample.json";
import type { Snapshot } from "@/lib/snapshot-schema";

const { getSnapshot } = vi.hoisted(() => ({ getSnapshot: vi.fn() }));
vi.mock("@/lib/get-snapshot", () => ({ getSnapshot }));

const { default: ReposPage } = await import("./page");

describe("ReposPage", () => {
  it("lists every repo from the snapshot with its role, GitHub link and CI status", async () => {
    getSnapshot.mockResolvedValue(fixtureSnapshot as Snapshot);
    render(await ReposPage());

    for (const repo of fixtureSnapshot.repos) {
      expect(screen.getByText(repo.name)).toBeInTheDocument();
    }

    // Doewe: has a GitHub link, a last commit, and a successful CI run
    const doeweLink = screen.getByRole("link", { name: /doewe/i });
    expect(doeweLink).toHaveAttribute("href", "https://github.com/konradthiemann/Doewe");
    expect(screen.getAllByText("Erfolgreich").length).toBeGreaterThan(0);

    // Pokekon: CI conclusion is "failure" in the fixture
    expect(screen.getByText("Fehlgeschlagen")).toBeInTheDocument();

    // agentic-infra-dashboard: ci is null in the fixture
    expect(screen.getAllByText("Kein CI-Status").length).toBeGreaterThan(0);
  });

  it("shows the calm fallback message when there is no snapshot", async () => {
    getSnapshot.mockResolvedValue(null);
    render(await ReposPage());

    expect(screen.getByText(/snapshot noch nicht verfügbar/i)).toBeInTheDocument();
  });
});
