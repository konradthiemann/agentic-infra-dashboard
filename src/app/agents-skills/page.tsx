import { getSnapshot } from "@/lib/get-snapshot";
import { SnapshotUnavailable } from "@/components/SnapshotUnavailable";
import type { AgentInfo, RuleInfo, SkillInfo } from "@/lib/snapshot-schema";

function ExampleBlock({ example }: { example: string | null }) {
  if (!example) return null;
  return (
    <p className="mt-2 rounded-md bg-zinc-50 p-2 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      <span className="font-semibold">Beispiel:</span> {example}
    </p>
  );
}

function AgentCard({ agent }: { agent: AgentInfo }) {
  return (
    <article className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{agent.name}</h3>
        {agent.model && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {agent.model}
          </span>
        )}
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{agent.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {agent.tools.map((tool) => (
          <span
            key={tool}
            className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {tool}
          </span>
        ))}
      </div>
      <ExampleBlock example={agent.example} />
    </article>
  );
}

function SkillCard({ skill }: { skill: SkillInfo }) {
  return (
    <article className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{skill.name}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{skill.description}</p>
      <ExampleBlock example={skill.example} />
    </article>
  );
}

function RuleCard({ rule }: { rule: RuleInfo }) {
  return (
    <article className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{rule.title}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{rule.summary}</p>
    </article>
  );
}

export default async function AgentsSkillsPage() {
  const snapshot = await getSnapshot();

  if (!snapshot) {
    return <SnapshotUnavailable />;
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Agents & Skills</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Globale Claude-Code-Subagents, Skills und Rules aus <code>~/.claude</code>.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Agents</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.agents.map((agent) => (
            <AgentCard key={agent.name} agent={agent} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Skills</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.skills.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Rules</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.rules.map((rule) => (
            <RuleCard key={rule.slug} rule={rule} />
          ))}
        </div>
      </section>
    </div>
  );
}
