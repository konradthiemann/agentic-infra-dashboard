import { describe, it, expect } from "vitest";
import fixtureSnapshot from "../../fixtures/snapshot.sample.json";
import { agentExamples } from "./agent-examples.ts";
import { skillExamples } from "./skill-examples.ts";
import { workflows } from "./workflows.ts";

// The sample snapshot drives local dev and the page tests, so it must not
// drift from the curated content the generator would emit today.
describe("fixtures/snapshot.sample.json", () => {
  it("carries the curated workflow definitions unchanged", () => {
    expect(fixtureSnapshot.workflows).toEqual(workflows);
  });

  it("uses the curated example for every agent", () => {
    for (const agent of fixtureSnapshot.agents) {
      expect(agent.example, agent.name).toBe(agentExamples[agent.name] ?? null);
    }
  });

  it("uses the curated example for every skill", () => {
    for (const skill of fixtureSnapshot.skills) {
      expect(skill.example, skill.name).toBe(skillExamples[skill.name] ?? null);
    }
  });

  it("has no curated agent example without a matching agent", () => {
    const agentNames = new Set(fixtureSnapshot.agents.map((a) => a.name));
    expect(Object.keys(agentExamples).filter((name) => !agentNames.has(name))).toEqual([]);
  });

  it("keeps the workspace counts consistent with its lists", () => {
    expect(fixtureSnapshot.workspace.agentCount).toBe(fixtureSnapshot.agents.length);
    expect(fixtureSnapshot.workspace.skillCount).toBe(fixtureSnapshot.skills.length);
  });
});
