import type { WorkflowDiagram, WorkflowEdge, WorkflowStep } from "./snapshot-schema";

/**
 * Computes each step's level as the longest path from a root (a step with
 * no incoming edges): a step's level is 0 if it has no predecessors, else
 * `max(predecessor levels) + 1`. Used to lay workflow diagrams out row by
 * row without pulling in a general-purpose graph-layout library.
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

const NODE_WIDTH = 200;
const NODE_HEIGHT = 76;
const GAP_X = 40;
const GAP_Y = 64;
const BYPASS_LANE_WIDTH = 48;

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
}

export interface WorkflowLayout {
  nodes: PositionedStep[];
  edges: PositionedEdge[];
  width: number;
  height: number;
}

/**
 * Lays a workflow diagram out row by row (one row per level, see
 * `computeStepLevels`), centering shorter rows within the widest one, and
 * computes a simple orthogonal (Manhattan) route for every edge:
 * - edges between adjacent levels get a short elbow straight into the
 *   target's top,
 * - edges that skip one or more levels are routed around a side "bypass
 *   lane" so they never cut through boxes sitting between source and
 *   target.
 * Intentionally hand-rolled rather than pulling in a graph-layout library —
 * these diagrams are small (<=11 nodes) and mostly linear.
 */
export function computeWorkflowLayout(diagram: WorkflowDiagram): WorkflowLayout {
  const { steps, edges } = diagram;
  const levels = computeStepLevels(steps, edges);

  const rows = new Map<number, WorkflowStep[]>();
  for (const step of steps) {
    const level = levels[step.id];
    const row = rows.get(level);
    if (row) row.push(step);
    else rows.set(level, [step]);
  }
  const maxLevel = Math.max(0, ...rows.keys());
  const maxRowLength = Math.max(1, ...Array.from(rows.values(), (row) => row.length));
  const contentWidth = maxRowLength * (NODE_WIDTH + GAP_X) - GAP_X;

  const positions = new Map<string, PositionedStep>();
  for (const [level, row] of rows) {
    const rowWidth = row.length * (NODE_WIDTH + GAP_X) - GAP_X;
    const offsetX = (contentWidth - rowWidth) / 2;
    row.forEach((step, column) => {
      positions.set(step.id, {
        ...step,
        level,
        x: offsetX + column * (NODE_WIDTH + GAP_X),
        y: level * (NODE_HEIGHT + GAP_Y),
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    });
  }

  // Edges that skip one or more levels can't go straight down (they'd cut
  // through whatever sits between source and target), so route each of
  // them through its own bypass lane to the right of the content area.
  const bypassEdges = edges.filter((e) => levels[e.to] - levels[e.from] > 1);
  const bypassLaneX = (index: number) => contentWidth + BYPASS_LANE_WIDTH * (index + 1);
  const totalBypassWidth = bypassEdges.length > 0 ? BYPASS_LANE_WIDTH * (bypassEdges.length + 1) : 0;

  const positionedEdges: PositionedEdge[] = edges.map((edge) => {
    const source = positions.get(edge.from);
    const target = positions.get(edge.to);
    if (!source || !target) return { edge, points: [] };

    const levelDiff = target.level - source.level;
    if (levelDiff <= 1) {
      const sx = source.x + source.width / 2;
      const sy = source.y + source.height;
      const tx = target.x + target.width / 2;
      const ty = target.y;
      const midY = sy + GAP_Y / 2;
      return {
        edge,
        points:
          sx === tx
            ? [
                { x: sx, y: sy },
                { x: tx, y: ty },
              ]
            : [
                { x: sx, y: sy },
                { x: sx, y: midY },
                { x: tx, y: midY },
                { x: tx, y: ty },
              ],
      };
    }

    const laneIndex = bypassEdges.indexOf(edge);
    const bypassX = bypassLaneX(laneIndex);
    const sy = source.y + source.height / 2;
    const ty = target.y + target.height / 2;
    return {
      edge,
      points: [
        { x: source.x + source.width, y: sy },
        { x: bypassX, y: sy },
        { x: bypassX, y: ty },
        { x: target.x + target.width, y: ty },
      ],
    };
  });

  return {
    nodes: Array.from(positions.values()),
    edges: positionedEdges,
    width: contentWidth + totalBypassWidth,
    height: (maxLevel + 1) * NODE_HEIGHT + maxLevel * GAP_Y,
  };
}
