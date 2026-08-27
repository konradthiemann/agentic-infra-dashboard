import fs from "node:fs/promises";
import { TDD_GATE_LOG } from "./paths.ts";
import type { RepoInfo, TddGateAggregate, MonitoringData } from "../../src/lib/snapshot-schema.ts";

const WINDOW_DAYS = 30;

interface TddBlockEvent {
  timestamp: string;
  repo: string;
  gate: string;
  command: string;
}

async function readTddGateEvents(): Promise<TddBlockEvent[]> {
  let raw: string;
  try {
    raw = await fs.readFile(TDD_GATE_LOG, "utf-8");
  } catch {
    return [];
  }
  const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const events: TddBlockEvent[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line) as TddBlockEvent;
      if (new Date(event.timestamp).getTime() >= cutoff) events.push(event);
    } catch {
      // skip malformed lines rather than fail the whole snapshot
    }
  }
  return events;
}

async function aggregateTddGate(): Promise<TddGateAggregate> {
  const events = await readTddGateEvents();
  const byRepo: Record<string, number> = {};
  const byGate: Record<string, number> = {};
  for (const event of events) {
    byRepo[event.repo] = (byRepo[event.repo] ?? 0) + 1;
    byGate[event.gate] = (byGate[event.gate] ?? 0) + 1;
  }
  const recentEvents = [...events]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 20);
  return {
    windowDays: WINDOW_DAYS,
    totalBlocks: events.length,
    byRepo,
    byGate,
    recentEvents,
  };
}

export async function scanMonitoring(repos: RepoInfo[]): Promise<MonitoringData> {
  const tddGate = await aggregateTddGate();
  const ci = repos
    .filter((repo) => repo.ci)
    .map((repo) => ({ ...(repo.ci as NonNullable<RepoInfo["ci"]>), repo: repo.name }));
  return { tddGate, ci };
}
