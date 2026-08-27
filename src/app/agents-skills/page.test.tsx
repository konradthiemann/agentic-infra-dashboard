import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import fixtureSnapshot from "../../../fixtures/snapshot.sample.json";
import type { Snapshot } from "@/lib/snapshot-schema";

const { getSnapshot } = vi.hoisted(() => ({ getSnapshot: vi.fn() }));
vi.mock("@/lib/get-snapshot", () => ({ getSnapshot }));

const { default: AgentsSkillsPage } = await import("./page");

describe("AgentsSkillsPage", () => {
  it("lists every agent, skill and rule from the snapshot", async () => {
    getSnapshot.mockResolvedValue(fixtureSnapshot as Snapshot);
    render(await AgentsSkillsPage());

    for (const agent of fixtureSnapshot.agents) {
      expect(screen.getByText(agent.name)).toBeInTheDocument();
    }
    for (const skill of fixtureSnapshot.skills) {
      expect(screen.getByText(skill.name)).toBeInTheDocument();
    }
    for (const rule of fixtureSnapshot.rules) {
      expect(screen.getByText(rule.title)).toBeInTheDocument();
    }
  });

  it("renders an agent's curated example distinctly labeled", async () => {
    getSnapshot.mockResolvedValue(fixtureSnapshot as Snapshot);
    render(await AgentsSkillsPage());

    const dataAnalyst = fixtureSnapshot.agents.find((a) => a.name === "data-analyst")!;
    expect(screen.getAllByText(/beispiel:/i).length).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(dataAnalyst.example!.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))).toBeInTheDocument();
  });

  it("omits the example block for a skill without a curated example", async () => {
    const withoutExample = {
      ...fixtureSnapshot,
      agents: [],
      rules: [],
      skills: [
        {
          name: "no-example-skill",
          description: "A skill without a curated example.",
          triggerHint: null,
          example: null,
        },
      ],
    };
    getSnapshot.mockResolvedValue(withoutExample as unknown as Snapshot);
    render(await AgentsSkillsPage());

    expect(screen.getByText("no-example-skill")).toBeInTheDocument();
    expect(screen.queryByText(/beispiel:/i)).not.toBeInTheDocument();
  });

  it("shows the calm fallback message when there is no snapshot", async () => {
    getSnapshot.mockResolvedValue(null);
    render(await AgentsSkillsPage());

    expect(screen.getByText(/snapshot noch nicht verfügbar/i)).toBeInTheDocument();
  });
});
