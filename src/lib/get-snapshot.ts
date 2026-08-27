import "server-only";
import { snapshotSchema, type Snapshot } from "./snapshot-schema";
import fixtureSnapshot from "../../fixtures/snapshot.sample.json";

const DEFAULT_SNAPSHOT_URL =
  "https://raw.githubusercontent.com/konradthiemann/agentic-infra-dashboard/data/snapshot.json";

function revalidateSeconds(): number {
  const raw = process.env.SNAPSHOT_REVALIDATE_SECONDS;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
}

/**
 * Fetches the live snapshot (raw GitHub content of the `data` branch).
 * In development, falls back to the committed fixture when the fetch fails
 * (e.g. no network, or the `data` branch doesn't exist yet locally) so the
 * app is usable offline. In production a failed fetch surfaces as `null` —
 * the UI must show a clear "not available" state, never crash or show
 * stale fixture data pretending to be live.
 */
export async function getSnapshot(): Promise<Snapshot | null> {
  const url = process.env.NEXT_PUBLIC_SNAPSHOT_URL || DEFAULT_SNAPSHOT_URL;

  try {
    const res = await fetch(url, { next: { revalidate: revalidateSeconds() } });
    if (!res.ok) throw new Error(`Snapshot fetch failed: ${res.status}`);
    const json = await res.json();
    const result = snapshotSchema.safeParse(json);
    if (!result.success) throw new Error("Snapshot failed schema validation");
    return result.data;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[get-snapshot] Live fetch from ${url} failed, falling back to fixtures/snapshot.sample.json:`,
        err,
      );
      const result = snapshotSchema.safeParse(fixtureSnapshot);
      return result.success ? result.data : null;
    }
    return null;
  }
}
