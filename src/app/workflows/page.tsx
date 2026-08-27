import { getSnapshot } from "@/lib/get-snapshot";
import { SnapshotUnavailable } from "@/components/SnapshotUnavailable";
import { WorkflowGraph } from "@/components/WorkflowGraph";

export default async function WorkflowsPage() {
  const snapshot = await getSnapshot();

  if (!snapshot) {
    return <SnapshotUnavailable />;
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Workflows</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Kern-Abläufe der Agentik-Infrastruktur als Diagramm — Kästen sind Schritte, Pfeile zeigen
          den Ablauf.
        </p>
      </div>

      {snapshot.workflows.map((workflow) => (
        <section key={workflow.slug} className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{workflow.title}</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{workflow.description}</p>
          </div>
          <WorkflowGraph diagram={workflow} />
        </section>
      ))}
    </div>
  );
}
