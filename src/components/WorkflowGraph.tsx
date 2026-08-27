import { computeWorkflowLayout, toRoundedPath, type EdgePoint } from "@/lib/workflow-layout";
import type { WorkflowDiagram } from "@/lib/snapshot-schema";

const PADDING = 28;
const CORNER_RADIUS = 14;

function midpoint(points: EdgePoint[]): EdgePoint {
  const mid = points[Math.floor((points.length - 1) / 2)];
  const next = points[Math.floor((points.length - 1) / 2) + 1] ?? mid;
  return { x: (mid.x + next.x) / 2, y: (mid.y + next.y) / 2 };
}

/**
 * Visual accent per step, driven by the `branch` field — the only place in
 * the data model that carries this kind of meaning (conditional step,
 * terminal pass/fail, parallel lane). `null` (the common case) gets the
 * neutral default.
 */
type Accent = "neutral" | "conditional" | "pass" | "fail" | "lane";

function accentFor(branch: string | null): Accent {
  if (branch === "conditional") return "conditional";
  if (branch === "pass") return "pass";
  if (branch === "fail") return "fail";
  if (branch?.startsWith("lane-")) return "lane";
  return "neutral";
}

const NODE_STYLES: Record<Accent, string> = {
  neutral:
    "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900",
  conditional:
    "border-amber-300 border-dashed bg-amber-50/60 dark:border-amber-700/70 dark:bg-amber-950/20",
  pass: "border-emerald-300 bg-emerald-50/70 dark:border-emerald-700/70 dark:bg-emerald-950/20",
  fail: "border-rose-300 bg-rose-50/70 dark:border-rose-700/70 dark:bg-rose-950/20",
  lane: "border-indigo-300 bg-indigo-50/60 dark:border-indigo-700/70 dark:bg-indigo-950/20",
};

const LABEL_STYLES: Record<Accent, string> = {
  neutral: "text-zinc-800 dark:text-zinc-100",
  conditional: "text-amber-800 dark:text-amber-200",
  pass: "text-emerald-800 dark:text-emerald-200",
  fail: "text-rose-800 dark:text-rose-200",
  lane: "text-indigo-800 dark:text-indigo-200",
};

const EDGE_STYLES: Record<"default" | "bypass", string> = {
  default: "stroke-zinc-300 dark:stroke-zinc-600",
  bypass: "stroke-zinc-300 [stroke-dasharray:5_4] dark:stroke-zinc-600",
};

export interface WorkflowGraphProps {
  diagram: WorkflowDiagram;
}

/**
 * Renders a workflow diagram as a small, hand-rolled left-to-right
 * flowchart: steps as color-accented boxes positioned column-by-column
 * (see `computeWorkflowLayout`), edges as smooth orthogonal connectors with
 * arrowheads and optional pill-backed labels.
 */
export function WorkflowGraph({ diagram }: WorkflowGraphProps) {
  const layout = computeWorkflowLayout(diagram);
  const totalWidth = layout.width + PADDING * 2;
  const totalHeight = layout.height + PADDING * 2;
  const markerId = `arrow-${diagram.slug}`;

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-[radial-gradient(circle,#e4e4e7_1px,transparent_1px)] bg-[length:20px_20px] p-5 dark:border-zinc-800 dark:bg-zinc-950 dark:bg-[radial-gradient(circle,#27272a_1px,transparent_1px)]">
      <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
        <svg
          className="absolute inset-0"
          width={totalWidth}
          height={totalHeight}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        >
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-zinc-400 dark:fill-zinc-500" />
            </marker>
          </defs>
          <g transform={`translate(${PADDING}, ${PADDING})`}>
            {layout.edges.map((positionedEdge) => {
              const { edge, points, isBypass } = positionedEdge;
              if (points.length === 0) return null;
              const label = edge.label;
              const labelPos = label ? midpoint(points) : null;
              return (
                <g key={`${edge.from}-${edge.to}`}>
                  <path
                    data-testid="workflow-edge"
                    d={toRoundedPath(points, CORNER_RADIUS)}
                    fill="none"
                    className={isBypass ? EDGE_STYLES.bypass : EDGE_STYLES.default}
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    markerEnd={`url(#${markerId})`}
                  />
                  {labelPos && label && (
                    <g>
                      <rect
                        x={labelPos.x - label.length * 3.1 - 5}
                        y={labelPos.y - 9}
                        width={label.length * 6.2 + 10}
                        height={16}
                        rx={5}
                        className="fill-zinc-50 stroke-zinc-200 dark:fill-zinc-900 dark:stroke-zinc-700"
                        strokeWidth={1}
                      />
                      <text
                        x={labelPos.x}
                        y={labelPos.y + 3}
                        textAnchor="middle"
                        className="fill-zinc-600 text-[10px] font-medium dark:fill-zinc-300"
                      >
                        {label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
        <div className="absolute inset-0" style={{ padding: PADDING }}>
          {layout.nodes.map((node) => {
            const accent = accentFor(node.branch);
            return (
              <div
                key={node.id}
                title={node.description ?? undefined}
                className={`absolute flex flex-col items-center justify-center gap-1 rounded-lg border px-3 py-2 text-center shadow-sm transition-shadow hover:shadow-md ${NODE_STYLES[accent]}`}
                style={{ left: node.x, top: node.y, width: node.width, height: node.height }}
              >
                <span className={`text-xs font-semibold ${LABEL_STYLES[accent]}`}>{node.label}</span>
                {node.description && (
                  <span className="line-clamp-3 text-[10.5px] leading-snug text-zinc-500 dark:text-zinc-400">
                    {node.description}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
