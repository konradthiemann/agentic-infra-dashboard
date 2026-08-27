import { getSnapshot } from "@/lib/get-snapshot";
import { SnapshotUnavailable } from "@/components/SnapshotUnavailable";
import { CiStatusBadge } from "@/components/CiStatusBadge";
import { formatRelativeDate } from "@/lib/format";
import type { TddGateAggregate } from "@/lib/snapshot-schema";

function TddGateSummary({ tddGate }: { tddGate: TddGateAggregate }) {
  if (tddGate.totalBlocks === 0) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Keine TDD-Gate-Blocks aufgezeichnet in den letzten {tddGate.windowDays} Tagen.
      </p>
    );
  }

  const repoEntries = Object.entries(tddGate.byRepo);
  const gateEntries = Object.entries(tddGate.byGate);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {tddGate.totalBlocks}
        </span>{" "}
        Blocks in den letzten {tddGate.windowDays} Tagen.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Je Repo</h3>
          <ul className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            {repoEntries.map(([repo, count]) => (
              <li key={repo} className="flex justify-between">
                <span>{repo}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Je Gate-Typ</h3>
          <ul className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            {gateEntries.map(([gate, count]) => (
              <li key={gate} className="flex justify-between">
                <span>{gate}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-2">Zeitpunkt</th>
              <th className="px-3 py-2">Repo</th>
              <th className="px-3 py-2">Gate</th>
              <th className="px-3 py-2">Kommando</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {tddGate.recentEvents.map((event, index) => (
              <tr key={`${event.timestamp}-${index}`}>
                <td className="whitespace-nowrap px-3 py-2 text-zinc-600 dark:text-zinc-400">
                  {formatRelativeDate(event.timestamp)}
                </td>
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">{event.repo}</td>
                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{event.gate}</td>
                <td className="px-3 py-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  {event.command}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function MonitoringPage() {
  const snapshot = await getSnapshot();

  if (!snapshot) {
    return <SnapshotUnavailable />;
  }

  const { tddGate, ci } = snapshot.monitoring;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Monitoring</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Wo die Agentik-Infrastruktur reibt: TDD-Gate-Blocks und CI-Status je Repo.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">TDD-Gate</h2>
        <TddGateSummary tddGate={tddGate} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">CI-Status je Repo</h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-3 py-2">Repo</th>
                <th className="px-3 py-2">Workflow</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Aktualisiert</th>
                <th className="px-3 py-2">Run</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {ci.map((run) => (
                <tr key={run.repo}>
                  <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">{run.repo}</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{run.workflow}</td>
                  <td className="px-3 py-2">
                    <CiStatusBadge status={run.status} conclusion={run.conclusion} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-zinc-600 dark:text-zinc-400">
                    {formatRelativeDate(run.updatedAt)}
                  </td>
                  <td className="px-3 py-2">
                    <a
                      href={run.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      Ansehen
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
