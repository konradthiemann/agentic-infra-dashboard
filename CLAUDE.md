# Agentic Infra Dashboard

Meta-Dashboard über Konrads KI-Agentik-Engineering-Infrastruktur: Repos im
`~/Softwareentwicklung`-Workspace, globale Claude-Code-Agents/Skills/Rules/Hooks,
Abläufe (Spec→Plan→Tester→Implementer, TDD-Gate, Worktrees) und ein einfaches
Monitoring (TDD-Gate-Blocks, CI-Status je Repo). Zweck: die Agentik-Infrastruktur
selbst sichtbar und verbesserbar machen — **kein** Business-/Umsatz-Dashboard
(das ist `control-plane`).

## Stack
Next.js 15 (App Router) · TypeScript strict · Tailwind CSS · Vitest + Testing Library

## Architektur: Wie die Daten aktuell bleiben
Die Rohdaten (Repos, `~/.claude/agents`, `~/.claude/skills`, `~/.claude/rules`,
lokale TDD-Gate-Logs) liegen **nur lokal** auf Konrads Mac. Diese App läuft
**remote** auf Railway und hat keinen Zugriff darauf. Lösung, ohne `main`-Schutz
zu verletzen und ohne Redeploy bei jedem Daten-Update:

1. `scripts/generate-snapshot.ts` scannt den Workspace + `~/.claude/*` und
   `~/.claude/logs/agentic-events.jsonl` und schreibt `snapshot.json`
   (Schema: `src/lib/snapshot-schema.ts`).
2. Der globale Hook `~/.claude/hooks/infra-dashboard-sync.sh` ruft dieses
   Skript auf und committet/pusht das Ergebnis **direkt auf den `data`-Branch**
   dieses Repos (ein separater, persistenter Klon unter
   `~/.claude/state/infra-dashboard-data/`, NICHT der Arbeitsbaum von `main`).
   Ausgelöst wird das über den `Stop`-Hook, aber nur wenn seit dem letzten Sync
   relevante Dateien geändert wurden (Dirty-Marker, siehe Hook-Kommentar) und
   mindestens 10 Minuten seit dem letzten Sync vergangen sind.
3. Die App liest `snapshot.json` zur Laufzeit per `fetch` von
   `NEXT_PUBLIC_SNAPSHOT_URL` (raw GitHub Content des `data`-Branch, öffentlich,
   kein Auth nötig) mit `revalidate: SNAPSHOT_REVALIDATE_SECONDS` — **kein
   Redeploy nötig**, um neue Daten zu zeigen.

`main` bleibt für App-Code beim normalen Workflow (PR + grüne CI). Der
`data`-Branch ist bot-only, nie per PR angefasst — siehe `specs/dashboard.md`
für die volle Begründung.

## Struktur
- `src/app/` — Seiten (Overview, Repos, Agents & Skills, Workflows, Monitoring)
- `src/lib/snapshot-schema.ts` — geteiltes Datenschema (Zod), von Generator + App genutzt
- `src/content/` — kuratierte Inhalte, die sich nicht zuverlässig scannen lassen
  (z. B. Skill-/Agent-Anwendungsbeispiele, Workflow-Diagramm-Definitionen)
- `scripts/generate-snapshot.ts` — Snapshot-Generator (läuft nur lokal auf Konrads Mac)
- `fixtures/snapshot.sample.json` — Beispiel-Snapshot für lokale Entwicklung/Tests

## Commands
```bash
npm run dev         # Dev-Server (nutzt fixtures/snapshot.sample.json wenn kein Snapshot-URL erreichbar)
npm run lint
npm run typecheck
npm run test
npm run build
npm run ci           # lint + typecheck + test + build
npm run snapshot     # Snapshot lokal generieren (nur sinnvoll auf Konrads Mac)
```

## Konventionen
Siehe Workspace-`CLAUDE.md` (`~/Softwareentwicklung/CLAUDE.md`) — Branches,
Commit-Format, Sprache (Code Englisch, Prosa Deutsch), TDD-Pflicht,
Quality-Gates. Dieses Projekt hat keine eigenen Agents — nutzt die globalen.

## Deploy
Live: https://agentic-infra-dashboard-production.up.railway.app

Railway, Service `agentic-infra-dashboard`, deployt automatisch bei Push auf
`main` mit grüner CI (analog `control-plane`, braucht dafür das GitHub-Secret
`RAILWAY_TOKEN` — ohne das Secret no-opt der Deploy-Job, siehe
`.github/workflows/ci.yml`). Manuelle Deploys: `railway up --service
agentic-infra-dashboard --detach`. Keine App-Secrets nötig — der
`data`-Branch ist öffentlich lesbar per raw GitHub Content.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
