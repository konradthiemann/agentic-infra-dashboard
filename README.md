# Agentic Infra Dashboard

Meta-Dashboard über Konrads KI-Agentik-Engineering-Infrastruktur: Repos unter
`~/Softwareentwicklung`, globale Claude-Code-Agents/Skills/Rules/Hooks, die
Abläufe, die sie bilden, und ein einfaches Monitoring (TDD-Gate-Blocks,
CI-Status je Repo). Reine Visualisierung — kein Business-/Umsatz-Dashboard
(das ist [`control-plane`](https://github.com/konradthiemann/control-plane)).

## Stack

Next.js (App Router) · TypeScript strict · Tailwind CSS · Vitest + Testing Library

## Wie die Daten aktuell bleiben

Kurzfassung — Details in [`CLAUDE.md`](./CLAUDE.md) und [`specs/dashboard.md`](./specs/dashboard.md):

1. `scripts/generate-snapshot.ts` scannt lokal (Repos, `~/.claude/*`,
   TDD-Gate-Logs) und schreibt `snapshot.json`.
2. Ein globaler Claude-Code-Hook (`~/.claude/hooks/infra-dashboard-sync.sh`)
   ruft das bei relevanten Änderungen automatisch auf und pusht das Ergebnis
   auf einen separaten, bot-only `data`-Branch dieses Repos — `main` bleibt
   für App-Code beim normalen PR-Workflow.
3. Die App liest `snapshot.json` zur Laufzeit per `fetch` von diesem
   `data`-Branch (raw GitHub Content, `revalidate`-gesteuert) — kein
   Redeploy pro Datenupdate nötig.

## Setup

```bash
npm install
cp .env.example .env.local   # optional, Defaults funktionieren ohne Anpassung
npm run dev
```

Ohne erreichbaren `data`-Branch (z. B. lokal vor dem ersten Sync) fällt die
App im Dev-Modus automatisch auf `fixtures/snapshot.sample.json` zurück.

## Scripts

```bash
npm run dev         # Dev-Server
npm run lint
npm run typecheck
npm run test
npm run build
npm run ci           # lint + typecheck + test + build
npm run snapshot     # Snapshot lokal neu generieren (nur sinnvoll auf Konrads Mac)
```

## Deploy

Railway, Service `agentic-infra-dashboard`, deployt automatisch bei Push auf
`main` mit grüner CI. Keine Secrets nötig.
