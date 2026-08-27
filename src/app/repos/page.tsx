import { getSnapshot } from "@/lib/get-snapshot";
import { SnapshotUnavailable } from "@/components/SnapshotUnavailable";
import { CiStatusBadge } from "@/components/CiStatusBadge";
import { formatRelativeDate } from "@/lib/format";
import type { RepoInfo } from "@/lib/snapshot-schema";

function RepoCard({ repo }: { repo: RepoInfo }) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          {repo.githubUrl ? (
            <a
              href={repo.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
            >
              {repo.name}
            </a>
          ) : (
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">{repo.name}</span>
          )}
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{repo.role}</p>
        </div>
        <CiStatusBadge status={repo.ci?.status ?? null} conclusion={repo.ci?.conclusion ?? null} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {repo.stack.map((tech) => (
          <span
            key={tech}
            className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {tech}
          </span>
        ))}
      </div>

      {repo.lastCommit && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Letzter Commit: &ldquo;{repo.lastCommit.message}&rdquo; — {repo.lastCommit.author},{" "}
          {formatRelativeDate(repo.lastCommit.date)}
        </p>
      )}

      {repo.ci && (
        <a
          href={repo.ci.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          CI-Run ansehen ({repo.ci.workflow})
        </a>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-zinc-100 pt-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span>Deploy: {repo.deployTarget ?? "kein Deploy"}</span>
        <span>{repo.hasOwnClaudeConfig ? "Eigene .claude/-Konfiguration" : "Nutzt globale Konfiguration"}</span>
      </div>
    </article>
  );
}

export default async function ReposPage() {
  const snapshot = await getSnapshot();

  if (!snapshot) {
    return <SnapshotUnavailable />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Repos</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Alle Repos unter <code>~/Softwareentwicklung</code>, mit Stack, Rolle, CI-Status und
          letztem Commit.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {snapshot.repos.map((repo) => (
          <RepoCard key={repo.slug} repo={repo} />
        ))}
      </div>
    </div>
  );
}
