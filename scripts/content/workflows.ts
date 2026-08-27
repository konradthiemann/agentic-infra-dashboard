import type { WorkflowDiagram } from "../../src/lib/snapshot-schema.ts";

/**
 * Curated workflow/diagram definitions — Konrad's actual processes, not
 * something scannable from the filesystem. Kept as simple linear/branching
 * step lists so the UI can render them without a graph-layout dependency.
 */
export const workflows: WorkflowDiagram[] = [
  {
    slug: "spec-driven-tdd",
    title: "Spec-Driven Development + Zwei-Agenten-TDD",
    description:
      "Der volle Weg von der Anforderung bis zum reviewbereiten Diff, für " +
      "nicht-triviale oder mehrdateiige Features (siehe .claude/rules/spec-driven-development.md).",
    steps: [
      { id: "spec", label: "Spec", description: "spec-Skill: Problem/Ziel, User Stories, Akzeptanzkriterien, Out of Scope.", branch: null },
      { id: "approval-spec", label: "Freigabe (Konrad)", description: "Menschliches Review-Gate — ohne Freigabe kein Übergang zum Plan.", branch: null },
      { id: "plan", label: "Plan", description: "planner-Agent: Datei-für-Datei-Plan inkl. Interfaces & Contracts.", branch: null },
      { id: "approval-plan", label: "Freigabe (Konrad)", description: "Zweites Gate vor Implementierung.", branch: null },
      { id: "tester", label: "Rot: tester", description: "Schreibt fehlschlagende Tests aus Spec-Kriterien + Plan-Kontrakten.", branch: null },
      { id: "implementer", label: "Grün: implementer", description: "Verifiziert den Rot-Grund, implementiert exakt gegen die Kontrakte.", branch: null },
      { id: "gates", label: "Quality-Gates", description: "lint/typecheck/test/build des Projekts — grün ist Pflicht.", branch: null },
      { id: "reviewer", label: "reviewer", description: "Prüft gegen die Akzeptanzkriterien der Spec.", branch: null },
      { id: "security", label: "security (bedingt)", description: "Nur bei Auth/Backend/Datenverarbeitung.", branch: "conditional" },
      { id: "docs", label: "docs", description: "README/CHANGELOG/Docblocks bei nutzersichtbaren Änderungen.", branch: null },
      { id: "commit", label: "commit-Skill", description: "Konrad entscheidet — kein automatischer Commit.", branch: null },
    ],
    edges: [
      { from: "spec", to: "approval-spec", label: null },
      { from: "approval-spec", to: "plan", label: null },
      { from: "plan", to: "approval-plan", label: null },
      { from: "approval-plan", to: "tester", label: null },
      { from: "tester", to: "implementer", label: "rot bestätigt" },
      { from: "implementer", to: "gates", label: null },
      { from: "gates", to: "reviewer", label: null },
      { from: "reviewer", to: "security", label: "falls Auth/Backend" },
      { from: "reviewer", to: "docs", label: "sonst direkt" },
      { from: "security", to: "docs", label: null },
      { from: "docs", to: "commit", label: null },
    ],
  },
  {
    slug: "tdd-gate-hook",
    title: "Globales TDD-Gate (tdd-gate.sh)",
    description:
      "Blockiert git commit ohne grünen Testlauf und gh pr create ohne " +
      "grüne Gates, seit der letzten Code-Änderung — automatisch durchgesetzt, " +
      "nicht nur als Konvention.",
    steps: [
      { id: "edit", label: "Edit/Write/MultiEdit", description: "Code-Datei geändert (Doku/specs zählt nicht als \"dirty\").", branch: null },
      { id: "mark-dirty", label: "PostToolUse: dirty markieren", description: "Legt .git/claude-{tdd,lint,typecheck}-dirty an.", branch: null },
      { id: "run-tests", label: "Testlauf (Bash)", description: "npm test / phpunit / pytest o. ä.", branch: null },
      { id: "clear-dirty", label: "PostToolUse: dirty löschen", description: "Nur bei Erfolg (exit 0) wird der jeweilige Marker entfernt.", branch: null },
      { id: "commit-attempt", label: "git commit (PreToolUse)", description: "Prüft Marker vor der Ausführung.", branch: null },
      { id: "blocked", label: "BLOCKED (exit 2)", description: "Commit wird verweigert, Grund wird ausgegeben.", branch: "fail" },
      { id: "allowed", label: "Commit erlaubt", description: "Kein offener dirty-Marker → Ausführung geht durch.", branch: "pass" },
    ],
    edges: [
      { from: "edit", to: "mark-dirty", label: null },
      { from: "mark-dirty", to: "run-tests", label: "vor dem Commit" },
      { from: "run-tests", to: "clear-dirty", label: "grün" },
      { from: "mark-dirty", to: "commit-attempt", label: "ohne Testlauf" },
      { from: "clear-dirty", to: "commit-attempt", label: null },
      { from: "commit-attempt", to: "blocked", label: "Marker noch da" },
      { from: "commit-attempt", to: "allowed", label: "kein Marker" },
    ],
  },
  {
    slug: "dashboard-sync",
    title: "Dashboard-Sync (dieses Dashboard)",
    description:
      "Wie dieses Dashboard selbst automatisch aktuell bleibt, ohne main " +
      "direkt zu committen und ohne Redeploy pro Datenupdate.",
    steps: [
      { id: "change", label: "Relevante Änderung", description: "Edit/Write unter ~/.claude/{agents,skills,rules,hooks} oder ein git commit in einem Workspace-Repo.", branch: null },
      { id: "mark-dirty", label: "PostToolUse: dashboard-dirty markieren", description: "infra-dashboard-sync.sh setzt einen Marker.", branch: null },
      { id: "stop", label: "Stop-Hook (async)", description: "Läuft am Ende jeder Session/Runde.", branch: null },
      { id: "throttle", label: "Marker + Throttle prüfen", description: "Nur wenn dirty UND letzter Sync ≥10min her.", branch: null },
      { id: "generate", label: "generate-snapshot.ts", description: "Scannt Repos, Agents, Skills, Rules, Hooks, lokale TDD-Gate-Logs, CI-Status.", branch: null },
      { id: "commit-data", label: "Commit auf data-Branch", description: "Separater persistenter Klon, NICHT der main-Arbeitsbaum.", branch: null },
      { id: "push", label: "git push", description: "Auf den bot-only data-Branch dieses Repos.", branch: null },
      { id: "fetch", label: "App: fetch zur Laufzeit", description: "Next.js liest raw GitHub Content mit revalidate — kein Redeploy nötig.", branch: null },
    ],
    edges: [
      { from: "change", to: "mark-dirty", label: null },
      { from: "mark-dirty", to: "stop", label: null },
      { from: "stop", to: "throttle", label: null },
      { from: "throttle", to: "generate", label: "sync fällig" },
      { from: "generate", to: "commit-data", label: null },
      { from: "commit-data", to: "push", label: null },
      { from: "push", to: "fetch", label: null },
    ],
  },
  {
    slug: "parallel-worktrees",
    title: "Parallele Agenten mit Worktrees",
    description:
      "Wie mehrere code-schreibende Subagents gleichzeitig arbeiten, ohne " +
      "sich gegenseitig Dateien zu überschreiben.",
    steps: [
      { id: "request", label: "Multi-Task-Anfrage", description: "Mehrere unabhängige Slices eines Features oder mehrere Aufgaben gleichzeitig.", branch: null },
      { id: "spawn", label: "Agent-Tool mit isolation: worktree", description: "Jeder Subagent bekommt einen eigenen Arbeitsbaum.", branch: null },
      { id: "wt1", label: "Worktree A", description: "Eigener Branch, eigenes Rot-Grün-Refactor.", branch: "lane-a" },
      { id: "wt2", label: "Worktree B", description: "Eigener Branch, eigenes Rot-Grün-Refactor.", branch: "lane-b" },
      { id: "integrate", label: "Ergebnisse integrieren", description: "Unveränderte Worktrees werden automatisch aufgeräumt.", branch: null },
    ],
    edges: [
      { from: "request", to: "spawn", label: null },
      { from: "spawn", to: "wt1", label: null },
      { from: "spawn", to: "wt2", label: null },
      { from: "wt1", to: "integrate", label: null },
      { from: "wt2", to: "integrate", label: null },
    ],
  },
];
