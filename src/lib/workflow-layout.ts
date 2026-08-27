import type { WorkflowDiagram, WorkflowEdge, WorkflowStep } from "./snapshot-schema";

/**
 * Computes each step's level as the longest path from a root (a step with
 * no incoming edges): a step's level is 0 if it has no predecessors, else
 * `max(predecessor levels) + 1`. Used to lay workflow diagrams out column by
 * column without pulling in a general-purpose graph-layout library.
 */
export function computeStepLevels(
  steps: WorkflowStep[],
  edges: WorkflowEdge[],
): Record<string, number> {
  const predecessors = new Map<string, string[]>();
  for (const step of steps) predecessors.set(step.id, []);
  for (const edge of edges) {
    predecessors.get(edge.to)?.push(edge.from);
  }

  const levels = new Map<string, number>();
  const visiting = new Set<string>();

  function levelOf(id: string): number {
    const cached = levels.get(id);
    if (cached !== undefined) return cached;
    // Cycle guard: diagrams are expected to be DAGs, but never hang on a
    // malformed one — treat a step revisited mid-recursion as level 0.
    if (visiting.has(id)) return 0;

    visiting.add(id);
    const preds = predecessors.get(id) ?? [];
    const level = preds.length === 0 ? 0 : Math.max(...preds.map(levelOf)) + 1;
    visiting.delete(id);

    levels.set(id, level);
    return level;
  }

  for (const step of steps) levelOf(step.id);

  return Object.fromEntries(levels);
}

const NODE_WIDTH = 216;
const NODE_HEIGHT = 88;
const GAP_X = 72;
const GAP_Y = 28;
const BYPASS_LANE_HEIGHT = 44;

export interface PositionedStep extends WorkflowStep {
  level: number;
  /** Top-left corner, in px, for absolute positioning. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EdgePoint {
  x: number;
  y: number;
}

export interface PositionedEdge {
  edge: WorkflowEdge;
  points: EdgePoint[];
  /** True when this edge skips one or more levels and is routed via a bypass lane. */
  isBypass: boolean;
}

export interface WorkflowLayout {
  nodes: PositionedStep[];
  edges: PositionedEdge[];
  width: number;
  height: number;
}

/**
 * Lays a workflow diagram out left to right — one column per level (see
 * `computeStepLevels`), steps at the same level stacked vertically and
 * centered within the tallest column — and computes a simple orthogonal
 * (Manhattan) route for every edge:
 * - edges between adjacent levels get a short elbow straight into the
 *   target's left edge,
 * - edges that skip one or more levels are routed through a bypass lane
 *   below the content area so they never cut through boxes sitting between
 *   source and target.
 * Intentionally hand-rolled rather than pulling in a graph-layout library —
 * these diagrams are small (<=11 nodes) and mostly linear, and reading left
 * to right matches how a pipeline is usually drawn.
 */
export function computeWorkflowLayout(diagram: WorkflowDiagram): WorkflowLayout {
  const { steps, edges } = diagram;
  const levels = computeStepLevels(steps, edges);

  const columns = new Map<number, WorkflowStep[]>();
  for (const step of steps) {
    const level = levels[step.id];
    const column = columns.get(level);
    if (column) column.push(step);
    else columns.set(level, [step]);
  }
  const maxLevel = Math.max(0, ...columns.keys());
  const maxColumnLength = Math.max(1, ...Array.from(columns.values(), (col) => col.length));
  const contentHeight = maxColumnLength * (NODE_HEIGHT + GAP_Y) - GAP_Y;

  const positions = new Map<string, PositionedStep>();
  for (const [level, column] of columns) {
    const columnHeight = column.length * (NODE_HEIGHT + GAP_Y) - GAP_Y;
    const offsetY = (contentHeight - columnHeight) / 2;
    column.forEach((step, row) => {
      positions.set(step.id, {
        ...step,
        level,
        x: level * (NODE_WIDTH + GAP_X),
        y: offsetY + row * (NODE_HEIGHT + GAP_Y),
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    });
  }

  // Edges that skip one or more levels can't go straight across (they'd cut
  // through whatever sits between source and target), so route each of them
  // through its own bypass lane below the content area.
  const bypassEdges = edges.filter((e) => levels[e.to] - levels[e.from] > 1);
  const bypassLaneY = (index: number) => contentHeight + BYPASS_LANE_HEIGHT * (index + 1);
  const totalBypassHeight = bypassEdges.length > 0 ? BYPASS_LANE_HEIGHT * (bypassEdges.length + 1) : 0;

  const positionedEdges: PositionedEdge[] = edges.map((edge) => {
    const source = positions.get(edge.from);
    const target = positions.get(edge.to);
    if (!source || !target) return { edge, points: [], isBypass: false };

    const levelDiff = target.level - source.level;
    if (levelDiff <= 1) {
      const sx = source.x + source.width;
      const sy = source.y + source.height / 2;
      const tx = target.x;
      const ty = target.y + target.height / 2;
      const midX = sx + GAP_X / 2;
      return {
        edge,
        points:
          sy === ty
            ? [
                { x: sx, y: sy },
                { x: tx, y: ty },
              ]
            : [
                { x: sx, y: sy },
                { x: midX, y: sy },
                { x: midX, y: ty },
                { x: tx, y: ty },
              ],
        isBypass: false,
      };
    }

    const laneIndex = bypassEdges.indexOf(edge);
    const bypassY = bypassLaneY(laneIndex);
    const sx = source.x + source.width / 2;
    const tx = target.x + target.width / 2;
    return {
      edge,
      points: [
        { x: sx, y: source.y + source.height },
        { x: sx, y: bypassY },
        { x: tx, y: bypassY },
        { x: tx, y: target.y + target.height },
      ],
      isBypass: true,
    };
  });

  return {
    nodes: Array.from(positions.values()),
    edges: positionedEdges,
    width: (maxLevel + 1) * NODE_WIDTH + maxLevel * GAP_X,
    height: contentHeight + totalBypassHeight,
  };
}

/**
 * Turns an orthogonal (Manhattan) polyline into a smooth SVG path string —
 * each interior corner gets rounded by `radius` (clamped to half the
 * shorter of its two adjacent segments, so short segments never overshoot).
 * Purely a rendering nicety: layout math above stays exact right angles.
 */
export function toRoundedPath(points: EdgePoint[], radius: number): string {
  if (points.length === 0) return "";
  if (points.length <= 2) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }

  const segments = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const inLen = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const outLen = Math.hypot(next.x - curr.x, next.y - curr.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);

    const inPoint = lerpTowards(curr, prev, r);
    const outPoint = lerpTowards(curr, next, r);

    segments.push(`L ${inPoint.x} ${inPoint.y}`);
    segments.push(`Q ${curr.x} ${curr.y} ${outPoint.x} ${outPoint.y}`);
  }
  const last = points.at(-1)!;
  segments.push(`L ${last.x} ${last.y}`);
  return segments.join(" ");
}

function lerpTowards(from: EdgePoint, to: EdgePoint, distance: number): EdgePoint {
  const len = Math.hypot(to.x - from.x, to.y - from.y);
  if (len === 0) return from;
  const t = distance / len;
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}
