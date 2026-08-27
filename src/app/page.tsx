import Link from "next/link";
import { getSnapshot } from "@/lib/get-snapshot";
import { SnapshotUnavailable } from "@/components/SnapshotUnavailable";

const SECTION_LINKS = [
  { href: "/repos", label: "Repos", description: "Stack, Rolle, CI-Status und letzter Commit je Repo." },
  {
    href: "/agents-skills",
    label: "Agents & Skills",
    description: "Globale Subagents, Skills und Rules mit Anwendungsbeispielen.",
  },
  {
    href: "/workflows",
    label: "Workflows",
    description: "Kern-Abläufe (Spec→Plan→Tester→Implementer, TDD-Gate, Dashboard-Sync) als Diagramm.",
  },
  {
    href: "/monitoring",
    label: "Monitoring",
    description: "TDD-Gate-Blocks und CI-Status je Repo.",
  },
] as const;

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

export default async function Home() {
  const snapshot = await getSnapshot();

  if (!snapshot) {
    return <SnapshotUnavailable />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Agentic Infra Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Meta-Übersicht über Konrads KI-Agentik-Engineering-Infrastruktur — Repos, globale
          Claude-Code-Agents/Skills/Rules und die Abläufe, die sie verbinden. Die Daten kommen aus
          einem Snapshot, der lokal generiert und über den Dashboard-Sync-Workflow automatisch
          aktuell gehalten wird — kein manuelles Pflegen, kein Redeploy nötig.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Repos" value={snapshot.workspace.repoCount} />
        <StatCard label="Agents" value={snapshot.workspace.agentCount} />
        <StatCard label="Skills" value={snapshot.workspace.skillCount} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTION_LINKS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{section.label}</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
