import { ciStatusColor, ciStatusLabel, type CiColor } from "@/lib/format";

const COLOR_CLASSES: Record<CiColor, string> = {
  green:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  gray: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

export interface CiStatusBadgeProps {
  status: string | null;
  conclusion: string | null;
}

/** Small colored badge (green/red/gray) for a CI run's status+conclusion. */
export function CiStatusBadge({ status, conclusion }: CiStatusBadgeProps) {
  const color = ciStatusColor(status, conclusion);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLOR_CLASSES[color]}`}
    >
      {ciStatusLabel(status, conclusion)}
    </span>
  );
}
