/**
 * Shared, calm fallback shown on every page when `getSnapshot()` resolves
 * to `null` (e.g. the `data` branch hasn't been pushed yet). Deliberately
 * neutral — this is an expected early-lifecycle state, not an error.
 */
export function SnapshotUnavailable() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-2 py-24 text-center">
      <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
        Snapshot noch nicht verfügbar
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Es konnten noch keine Daten geladen werden — vermutlich wurde der{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">
          data
        </code>
        -Branch mit dem Snapshot noch nicht erzeugt. Sobald der Dashboard-Sync-Hook einmal gelaufen
        ist, erscheinen die Daten hier automatisch.
      </p>
    </div>
  );
}
