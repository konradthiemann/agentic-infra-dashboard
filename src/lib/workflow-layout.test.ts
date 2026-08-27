import { describe, it, expect } from "vitest";
import { computeStepLevels, computeWorkflowLayout } from "./workflow-layout";
import type { WorkflowDiagram, WorkflowEdge, WorkflowStep } from "./snapshot-schema";

function step(id: string, branch: string | null = null): WorkflowStep {
  return { id, label: id, description: null, branch };
}

function edge(from: string, to: string, label: string | null = null): WorkflowEdge {
  return { from, to, label };
}

function diagram(steps: WorkflowStep[], edges: WorkflowEdge[]): WorkflowDiagram {
  return { slug: "test", title: "Test", description: "Test diagram", steps, edges };
}

describe("computeStepLevels", () => {
  it("assigns increasing levels along a linear chain", () => {
    const steps = [step("a"), step("b"), step("c")];
    const edges = [edge("a", "b"), edge("b", "c")];

    expect(computeStepLevels(steps, edges)).toEqual({ a: 0, b: 1, c: 2 });
  });

  it("puts branching steps at the same level", () => {
    const steps = [step("a"), step("b"), step("c")];
    const edges = [edge("a", "b"), edge("a", "c")];

    expect(computeStepLevels(steps, edges)).toEqual({ a: 0, b: 1, c: 1 });
  });

  it("levels a merge step after the deepest predecessor", () => {
    // a -> c, b -> c, with b reachable one step further than a
    const steps = [step("a"), step("b"), step("x"), step("c")];
    const edges = [edge("a", "x"), edge("x", "c"), edge("b", "c")];

    const levels = computeStepLevels(steps, edges);
    expect(levels.a).toBe(0);
    expect(levels.b).toBe(0);
    expect(levels.x).toBe(1);
    expect(levels.c).toBe(2);
  });

  it("treats steps with no incoming edges as level 0, even if isolated", () => {
    const steps = [step("a"), step("isolated")];
    const edges: WorkflowEdge[] = [];

    expect(computeStepLevels(steps, edges)).toEqual({ a: 0, isolated: 0 });
  });

  it("handles a diamond shape correctly", () => {
    const steps = [step("a"), step("b"), step("c"), step("d")];
    const edges = [edge("a", "b"), edge("a", "c"), edge("b", "d"), edge("c", "d")];

    expect(computeStepLevels(steps, edges)).toEqual({ a: 0, b: 1, c: 1, d: 2 });
  });
});

describe("computeWorkflowLayout", () => {
  it("produces exactly one positioned node per step", () => {
    const d = diagram(
      [step("a"), step("b"), step("c")],
      [edge("a", "b"), edge("b", "c")],
    );
    const layout = computeWorkflowLayout(d);
    expect(layout.nodes).toHaveLength(3);
    expect(layout.nodes.map((n) => n.id)).toEqual(["a", "b", "c"]);
  });

  it("gives siblings at the same level the same y but a different x", () => {
    const d = diagram(
      [step("spawn"), step("wt1", "lane-a"), step("wt2", "lane-b"), step("integrate")],
      [edge("spawn", "wt1"), edge("spawn", "wt2"), edge("wt1", "integrate"), edge("wt2", "integrate")],
    );
    const layout = computeWorkflowLayout(d);
    const wt1 = layout.nodes.find((n) => n.id === "wt1")!;
    const wt2 = layout.nodes.find((n) => n.id === "wt2")!;

    expect(wt1.level).toBe(wt2.level);
    expect(wt1.y).toBe(wt2.y);
    expect(wt1.x).not.toBe(wt2.x);
  });

  it("increases y for every level down the diagram", () => {
    const d = diagram([step("a"), step("b"), step("c")], [edge("a", "b"), edge("b", "c")]);
    const layout = computeWorkflowLayout(d);
    const [a, b, c] = ["a", "b", "c"].map((id) => layout.nodes.find((n) => n.id === id)!);

    expect(b.y).toBeGreaterThan(a.y);
    expect(c.y).toBeGreaterThan(b.y);
  });

  it("routes an adjacent-level edge as a short elbow between the two nodes", () => {
    const d = diagram([step("a"), step("b")], [edge("a", "b")]);
    const layout = computeWorkflowLayout(d);
    const positionedEdge = layout.edges[0];
    const a = layout.nodes.find((n) => n.id === "a")!;
    const b = layout.nodes.find((n) => n.id === "b")!;

    // starts at the bottom-center of the source, ends at the top-center of the target
    expect(positionedEdge.points[0]).toEqual({ x: a.x + a.width / 2, y: a.y + a.height });
    expect(positionedEdge.points.at(-1)).toEqual({ x: b.x + b.width / 2, y: b.y });
    // stays within the diagram's content bounds (no unnecessary detour)
    for (const point of positionedEdge.points) {
      expect(point.x).toBeLessThanOrEqual(layout.width);
    }
  });

  it("routes an edge that skips a level via a bypass lane outside the content width", () => {
    // a -> b -> c -> d, plus a shortcut a -> d that skips two levels
    const d = diagram(
      [step("a"), step("b"), step("c"), step("d")],
      [edge("a", "b"), edge("b", "c"), edge("c", "d"), edge("a", "d")],
    );
    const layout = computeWorkflowLayout(d);
    const bypassEdge = layout.edges.find((e) => e.edge.from === "a" && e.edge.to === "d")!;
    const contentWidth = Math.max(...layout.nodes.map((n) => n.x));

    expect(bypassEdge.points.some((p) => p.x > contentWidth)).toBe(true);
    // total diagram width accounts for the bypass lane
    expect(layout.width).toBeGreaterThan(contentWidth);
  });

  it("keeps total height proportional to the number of levels", () => {
    const linear = diagram([step("a"), step("b")], [edge("a", "b")]);
    const longer = diagram(
      [step("a"), step("b"), step("c")],
      [edge("a", "b"), edge("b", "c")],
    );
    expect(computeWorkflowLayout(longer).height).toBeGreaterThan(computeWorkflowLayout(linear).height);
  });
});
