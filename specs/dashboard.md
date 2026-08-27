# Spec: Agentic Infra Dashboard (MVP)

## Problem/Ziel
Konrad betreibt mehrere Repos und ein globales, agentisches Claude-Code-Setup
(Subagents, Skills, Rules, Hooks) unter `~/Softwareentwicklung`. Dieses Setup
existiert nur als verstreute Dateien (CLAUDE.md-Dateien, `.claude/agents`,
`.claude/skills`, `.claude/rules`, Hook-Skripte) — es gibt keine zentrale,
visuelle Übersicht. Ziel: eine deployte Webanwendung, die

1. die aktuelle Infrastruktur (Repos, Stacks, Deploy-Ziele) zeigt,
2. das Cloud-/Agenten-Setup (Subagents, Skills, Rules, Hooks) mit Erklärung
   und Anwendungsbeispiel auflistet,
3. zentrale Abläufe (Spec→Plan→Tester→Implementer, TDD-Gate, Worktree-Flow,
   Dashboard-Sync selbst) visuell als Diagramm darstellt,
4. eine einfache Fehleranalyse/Monitoring der Agentik-Infrastruktur bietet
   (wie oft blockiert das TDD-Gate wo, aktueller CI-Status je Repo),

damit Konrad die eigene Engineering-Infrastruktur gezielt verbessern kann,
statt sie nur im Kopf zu haben.

## User Stories
- Als Konrad will ich auf einen Blick sehen, welche Repos es gibt, mit
  welchem Stack, welcher Rolle und welchem Deploy-Ziel — ohne jede CLAUDE.md
  einzeln zu öffnen.
- Als Konrad will ich verstehen, welche globalen Skills/Agents es gibt, wofür
  sie gedacht sind und wie ich sie triggere — inklusive eines Beispiels je
  Skill/Agent, nicht nur des rohen Beschreibungstexts.
- Als Konrad will ich Kern-Abläufe (z. B. TDD-Gate, Spec-Driven-Flow) als
  Diagramm sehen, um Lücken oder Redundanzen im Setup zu erkennen.
- Als Konrad will ich sehen, wie oft und wo das globale TDD-Gate Commits/PRs
  blockiert, und den aktuellen CI-Status jedes Repos — um zu erkennen, wo die
  Infrastruktur reibt.
- Als Konrad will ich, dass das Dashboard von selbst aktuell bleibt, ohne dass
  ich manuell Daten pflegen oder redeployen muss.

## Akzeptanzkriterien
- [ ] Übersichtsseite listet alle Repos aus `~/Softwareentwicklung` (Name,
      Stack, Rolle, GitHub-Link, letzter Commit, CI-Status) — Datenquelle:
      generierter Snapshot, nicht Live-Dateisystem-Zugriff zur Laufzeit.
- [ ] Agents/Skills-Seite listet jeden globalen Agent (`~/.claude/agents/*.md`)
      und Skill (`~/.claude/skills/*/SKILL.md`) mit Name, Beschreibung (aus
      Frontmatter, live gescannt) und einem kuratierten Anwendungsbeispiel
      (`src/content/`).
- [ ] Rules-Übersicht listet `~/.claude/rules/*.md` mit Kurzbeschreibung.
- [ ] Mindestens 3 Workflow-Diagramme: (1) Spec→Plan→Tester→Implementer→
      Review, (2) TDD-Gate-Ablauf (PreToolUse/PostToolUse-Blockierlogik),
      (3) Dashboard-Sync selbst (Hook→Generator→data-Branch→Laufzeit-Fetch).
- [ ] Monitoring-Seite zeigt: TDD-Gate-Blocks aggregiert (gesamt, je Repo, je
      Gate-Typ test/lint/typecheck, letzte N Events) und aktuellen
      GitHub-Actions-CI-Status je Repo (letzter Run: Status, Conclusion,
      Zeitpunkt, Link).
- [ ] Snapshot wird von einem globalen Claude-Code-Hook automatisch aktuell
      gehalten (kein manueller Trigger nötig), ohne dass dafür `main` direkt
      committet/gepusht wird (Branch-Schutz bleibt intakt) und ohne dass jedes
      Datenupdate einen Railway-Redeploy braucht.
- [ ] App läuft auf Railway unter einer erreichbaren URL, Build via
      `npm run ci` grün.
- [ ] Fehlt der Snapshot zur Laufzeit (z. B. `data`-Branch noch nicht
      gepusht), zeigt die App einen klaren Hinweis statt einem Crash.

## Out of Scope (MVP)
- Cloud-Agent-Task-Historie (Erfolg/Fehlschlag einzelner Subagent-Läufe) —
  laut Klärung mit Konrad nicht Teil des MVP-Monitorings.
- Status der Scheduled Cloud Agents (CronList) — nicht Teil des MVP.
- Schreibender Zugriff/Interaktion aus dem Dashboard heraus (z. B. Hooks
  editieren, Skills anlegen) — reine Anzeige.
- Auth/Login — Dashboard zeigt nichts Geheimes (alle Repos ohnehin öffentlich,
  keine Secrets im Snapshot), daher öffentlich erreichbar ohne Login.
- Historische Trends über Zeit (z. B. Blocks pro Woche als Zeitreihe) — MVP
  zeigt nur aktuelle Aggregate; Zeitreihen sind ein möglicher Ausbauschritt.
- Mobile-optimiertes Layout über "funktioniert brauchbar" hinaus.

## Offene Fragen
- Keine offenen Blocker mehr nach Rückfrage mit Konrad (Repo-Standort,
  Sync-Mechanismus, Monitoring-Scope, Tech-Stack sind entschieden — siehe
  `CLAUDE.md` dieses Repos für die Architektur-Entscheidung zum `data`-Branch).
- Später zu klären, falls gewünscht: Erweiterung um Agent-Task-Historie und
  Scheduled-Tasks-Status (aktuell bewusst Out of Scope).
