import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import fixtureSnapshot from "../../../fixtures/snapshot.sample.json";
import type { Snapshot } from "@/lib/snapshot-schema";

const { getSnapshot } = vi.hoisted(() => ({ getSnapshot: vi.fn() }));
vi.mock("@/lib/get-snapshot", () => ({ getSnapshot }));

const { default: MonitoringPage } = await import("./page");

describe("MonitoringPage", () => {
  it("shows a positive empty state when no TDD-gate blocks were recorded", async () => {
    getSnapshot.mockResolvedValue(fixtureSnapshot as Snapshot); // fixture has totalBlocks: 0
    render(await MonitoringPage());

    expect(screen.getByText(/keine.*blocks/i)).toBeInTheDocument();
  });

  it("lists every repo's latest CI run", async () => {
    getSnapshot.mockResolvedValue(fixtureSnapshot as Snapshot);
    render(await MonitoringPage());

    for (const ci of fixtureSnapshot.monitoring.ci) {
      expect(screen.getByText(ci.repo)).toBeInTheDocument();
    }
    expect(screen.getByText("Fehlgeschlagen")).toBeInTheDocument();
  });

  it("shows the TDD-gate breakdown and recent events when blocks exist", async () => {
    const withBlocks = {
      ...fixtureSnapshot,
      monitoring: {
        ...fixtureSnapshot.monitoring,
        tddGate: {
          windowDays: 30,
          totalBlocks: 4,
          byRepo: { Doewe: 3, Pokekon: 1 },
          byGate: { test: 2, lint: 1, typecheck: 1 },
          recentEvents: [
            { timestamp: "2026-08-25T10:00:00Z", repo: "Doewe", gate: "test", command: "git commit" },
          ],
        },
      },
    };
    getSnapshot.mockResolvedValue(withBlocks as unknown as Snapshot);
    render(await MonitoringPage());

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("git commit")).toBeInTheDocument();
  });

  it("shows the calm fallback message when there is no snapshot", async () => {
    getSnapshot.mockResolvedValue(null);
    render(await MonitoringPage());

    expect(screen.getByText(/snapshot noch nicht verfügbar/i)).toBeInTheDocument();
  });
});
