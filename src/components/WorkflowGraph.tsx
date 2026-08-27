import { computeWorkflowLayout, type EdgePoint } from "@/lib/workflow-layout";
import type { WorkflowDiagram } from "@/lib/snapshot-schema";

const PADDING = 24;

function midpoint(points: EdgePoint[]): EdgePoint {
  const mid = points[Math.floor((points.length - 1) / 2)];
  const next = points[Math.floor((points.length - 1) / 2) + 1] ?? mid;
  return { x: (mid.x + next.x) / 2, y: (mid.y + next.y) / 2 };
}

/** Direction of the final segment, used to orient the arrowhead. */
function arrowDirection(points: EdgePoint[]): "down" | "up" | "left" | "right" {
  const end = points.at(-1)!;
  const prev = points.at(-2) ?? end;
  if (end.y > prev.y) return "down";
  if (end.y < prev.y) return "up";
  return end.x > prev.x ? "right" : "left";
}

const ARROW_SIZE = 6;

function Arrowhead({ points }: { points: EdgePoint[] }) {
  const end = points.at(-1);
  if (!end) return null;
  const direction = arrowDirection(points);
  const trianglesByDirection: Record<typeof direction, string> = {
    down: `${end.x - ARROW_SIZE},${end.y - ARROW_SIZE} ${end.x + ARROW_SIZE},${end.y - ARROW_SIZE} ${end.x},${end.y}`,
    up: `${end.x - ARROW_SIZE},${end.y + ARROW_SIZE} ${end.x + ARROW_SIZE},${end.y + ARROW_SIZE} ${end.x},${end.y}`,
    left: `${end.x + ARROW_SIZE},${end.y - ARROW_SIZE} ${end.x + ARROW_SIZE},${end.y + ARROW_SIZE} ${end.x},${end.y}`,
    right: `${end.x - ARROW_SIZE},${end.y - ARROW_SIZE} ${end.x - ARROW_SIZE},${end.y + ARROW_SIZE} ${end.x},${end.y}`,
  };
  return <polygon points={trianglesByDirection[direction]} className="fill-zinc-400 dark:fill-zinc-500" />;
}

export interface WorkflowGraphProps {
  diagram: WorkflowDiagram;
}

/**
 * Renders a workflow diagram as a small, hand-rolled flowchart: steps as
 * boxes positioned row-by-row (see `computeWorkflowLayout`), edges as
 * orthogonal connecting lines with arrowheads and optional labels.
 */
export function WorkflowGraph({ diagram }: WorkflowGraphProps) {
  const layout = computeWorkflowLayout(diagram);
  const totalWidth = layout.width + PADDING * 2;
  const totalHeight = layout.height + PADDING * 2;

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
      <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
        <svg
          className="absolute inset-0"
          width={totalWidth}
          height={totalHeight}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        >
          <g transform={`translate(${PADDING}, ${PADDING})`}>
            {layout.edges.map((positionedEdge) => {
              const { edge, points } = positionedEdge;
              if (points.length === 0) return null;
              const label = edge.label;
              const labelPos = label ? midpoint(points) : null;
              return (
                <g key={`${edge.from}-${edge.to}`}>
                  <polyline
                    points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    className="stroke-zinc-400 dark:stroke-zinc-500"
                    strokeWidth={1.5}
                  />
                  <Arrowhead points={points} />
                  {labelPos && (
                    <text
                      x={labelPos.x}
                      y={labelPos.y - 4}
                      textAnchor="middle"
                      className="fill-zinc-600 text-[10px] dark:fill-zinc-300"
                    >
                      {label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
        <div className="absolute inset-0" style={{ padding: PADDING }}>
          {layout.nodes.map((node) => (
            <div
              key={node.id}
              title={node.description ?? undefined}
              className="absolute flex flex-col items-center justify-center gap-0.5 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
              style={{ left: node.x, top: node.y, width: node.width, height: node.height }}
            >
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                {node.label}
              </span>
              {node.description && (
                <span className="line-clamp-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                  {node.description}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
