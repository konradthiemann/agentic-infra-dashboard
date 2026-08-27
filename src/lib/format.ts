/**
 * Small, dependency-free formatting helpers shared across pages.
 * German output — this dashboard's UI language.
 */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MAX_RELATIVE_DAYS = 30;

/**
 * Formats an ISO timestamp as a German relative time string
 * ("vor 3 Stunden"), falling back to a plain DD.MM.YYYY date once the
 * difference exceeds 30 days.
 */
export function formatRelativeDate(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();

  if (diffMs < MINUTE) return "gerade eben";
  if (diffMs < HOUR) return `vor ${Math.floor(diffMs / MINUTE)} Minuten`;
  if (diffMs < DAY) return `vor ${Math.floor(diffMs / HOUR)} Stunden`;
  if (diffMs < MAX_RELATIVE_DAYS * DAY) return `vor ${Math.floor(diffMs / DAY)} Tagen`;

  const day = String(then.getUTCDate()).padStart(2, "0");
  const month = String(then.getUTCMonth() + 1).padStart(2, "0");
  const year = then.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

export type CiColor = "green" | "red" | "gray";

/** Maps a GitHub Actions status/conclusion pair to a traffic-light color. */
export function ciStatusColor(status: string | null, conclusion: string | null): CiColor {
  if (status !== "completed") return "gray";
  if (conclusion === "success") return "green";
  if (conclusion === null) return "gray";
  return "red";
}

/** German, human-readable label for a GitHub Actions status/conclusion pair. */
export function ciStatusLabel(status: string | null, conclusion: string | null): string {
  if (status === null) return "Kein CI-Status";
  if (status !== "completed") return "Läuft";
  switch (conclusion) {
    case "success":
      return "Erfolgreich";
    case "failure":
      return "Fehlgeschlagen";
    case "cancelled":
      return "Abgebrochen";
    case null:
      return "Unbekannt";
    default:
      return conclusion;
  }
}
