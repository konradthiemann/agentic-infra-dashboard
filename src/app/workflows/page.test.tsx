import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import fixtureSnapshot from "../../../fixtures/snapshot.sample.json";
import type { Snapshot } from "@/lib/snapshot-schema";

const { getSnapshot } = vi.hoisted(() => ({ getSnapshot: vi.fn() }));
vi.mock("@/lib/get-snapshot", () => ({ getSnapshot }));

const { default: WorkflowsPage } = await import("./page");

describe("WorkflowsPage", () => {
  it("renders every workflow diagram with its title and all step labels", async () => {
    getSnapshot.mockResolvedValue(fixtureSnapshot as Snapshot);
    render(await WorkflowsPage());

    for (const workflow of fixtureSnapshot.workflows) {
      expect(screen.getByText(workflow.title)).toBeInTheDocument();
      for (const step of workflow.steps) {
        expect(screen.getAllByText(step.label).length).toBeGreaterThan(0);
      }
    }
  });

  it("shows the calm fallback message when there is no snapshot", async () => {
    getSnapshot.mockResolvedValue(null);
    render(await WorkflowsPage());

    expect(screen.getByText(/snapshot noch nicht verfügbar/i)).toBeInTheDocument();
  });
});
