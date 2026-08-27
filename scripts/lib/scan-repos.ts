import fs from "node:fs/promises";
import path from "node:path";
import { WORKSPACE_ROOT, NON_REPO_DIRS } from "./paths.ts";
import { tryRun } from "./exec.ts";
import { curatedRepos } from "../content/repos.ts";
import { toGithubUrl, slugFromGithubUrl } from "./github-url.ts";
import type { RepoInfo, RepoCiStatus } from "../../src/lib/snapshot-schema.ts";

async function detectStackFallback(repoPath: string): Promise<string[]> {
  const stack: string[] = [];
  if (await fileExists(path.join(repoPath, "package.json"))) stack.push("Node");
  if (await fileExists(path.join(repoPath, "composer.json"))) stack.push("PHP");
  if (await fileExists(path.join(repoPath, "index.html"))) stack.push("Static HTML/JS");
  return stack.length ? stack : ["unbekannt"];
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function fetchCiStatus(ghSlug: string): Promise<RepoCiStatus | null> {
  const raw = await tryRun("gh", [
    "run",
    "list",
    "--repo",
    ghSlug,
    "--limit",
    "1",
    "--json",
    "workflowName,status,conclusion,updatedAt,url",
  ]);
  if (!raw) return null;
  try {
    const [run] = JSON.parse(raw) as Array<{
      workflowName: string;
      status: string;
      conclusion: string | null;
      updatedAt: string;
      url: string;
    }>;
    if (!run) return null;
    return {
      workflow: run.workflowName,
      status: run.status,
      conclusion: run.conclusion,
      updatedAt: run.updatedAt,
      url: run.url,
    };
  } catch {
    return null;
  }
}

async function fetchDefaultBranch(ghSlug: string, fallback: string): Promise<string> {
  const raw = await tryRun("gh", ["api", `repos/${ghSlug}`, "-q", ".default_branch"]);
  return raw || fallback;
}

async function fetchLastCommit(repoPath: string, branch: string) {
  const format = "%H%x1f%s%x1f%cI%x1f%an";
  const raw =
    (await tryRun("git", ["log", "-1", `--format=${format}`, branch], repoPath)) ??
    (await tryRun("git", ["log", "-1", `--format=${format}`], repoPath));
  if (!raw) return null;
  const [sha, message, date, author] = raw.split("\x1f");
  return { sha, message, date, author };
}

export async function scanRepos(): Promise<RepoInfo[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(WORKSPACE_ROOT);
  } catch {
    return [];
  }

  const repos: RepoInfo[] = [];
  for (const entry of entries.sort()) {
    if (NON_REPO_DIRS.has(entry) || entry.startsWith(".")) continue;
    const repoPath = path.join(WORKSPACE_ROOT, entry);
    const stat = await fs.stat(repoPath).catch(() => null);
    if (!stat?.isDirectory()) continue;
    if (!(await fileExists(path.join(repoPath, ".git")))) continue;

    const remote = await tryRun("git", ["remote", "get-url", "origin"], repoPath);
    const githubUrl = toGithubUrl(remote);
    const ghSlug = slugFromGithubUrl(githubUrl);
    const hasOwnClaudeConfig = await fileExists(path.join(repoPath, ".claude"));
    const localBranch =
      (await tryRun("git", ["symbolic-ref", "--short", "HEAD"], repoPath)) ?? "main";

    const curated = curatedRepos[entry];
    const defaultBranch = ghSlug ? await fetchDefaultBranch(ghSlug, localBranch) : localBranch;
    const lastCommit = await fetchLastCommit(repoPath, defaultBranch);
    const ci = ghSlug ? await fetchCiStatus(ghSlug) : null;

    repos.push({
      slug: entry,
      name: entry,
      role: curated?.role ?? "App",
      stack: curated?.stack ?? (await detectStackFallback(repoPath)),
      githubUrl,
      deployTarget: curated?.deployTarget ?? null,
      defaultBranch,
      hasOwnClaudeConfig,
      lastCommit,
      ci,
    });
  }
  return repos;
}
