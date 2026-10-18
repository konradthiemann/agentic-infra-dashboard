import type { WorkflowDiagram } from "../../src/lib/snapshot-schema.ts";

/**
 * Curated workflow/diagram definitions — Konrad's actual processes, not
 * something scannable from the filesystem. Kept as simple linear/branching
 * step lists so the UI can render them without a graph-layout dependency.
 */
export const workflows: WorkflowDiagram[] = [
  {
    slug: "feature-flow",
    title: "Feature-Ablauf (/feature): Hauptsession + unabhängige Prüfer",
    description:
      "Der Weg von der Anforderung bis zum reviewbereiten Diff für nicht-triviale " +
      "Änderungen (siehe ~/.claude/skills/feature/SKILL.md): umgesetzt in der " +
      "Hauptsession, Subagents nur für unabhängige Prüfung oder parallele Slices.",
    steps: [
      { id: "clarify", label: "Anforderungen klären", description: "Trivialer Fix: Test zuerst, dann Code. Offene Produktfragen: spec-Skill + Konrads Freigabe.", branch: null },
      { id: "plan", label: "Plan-Mode", description: "Betroffene Dateien, Schnittstellen, Reihenfolge, prüfbare Akzeptanzkriterien — Freigabe durch Konrad.", branch: null },
      { id: "red-green", label: "Rot → Grün", description: "Hauptsession: je Akzeptanzkriterium ein Test, Rot aus dem richtigen Grund, minimal implementieren, aufräumen.", branch: null },
      { id: "tester", label: "tester (parallele Slice)", description: "Nur bei unabhängigen Slices: schreibt im Worktree die Tests der nächsten Slice vor.", branch: "conditional" },
      { id: "gates", label: "Quality-Gates", description: "lint/typecheck/test(/build) des Projekts — grün ist Pflicht, ehrlich berichten.", branch: null },
      { id: "reviewer", label: "reviewer", description: "Unabhängiger Prüfer mit frischem Kontext, gegen die Akzeptanzkriterien.", branch: null },
      { id: "security", label: "security (bedingt)", description: "Zusätzlich bei Auth, Nutzereingaben, Geld, Secrets oder externen APIs.", branch: "conditional" },
      { id: "docs", label: "Doku", description: "Betroffene Doku im selben Zug — bei großem Umfang der docs-Agent.", branch: null },
      { id: "commit", label: "commit-Skill", description: "Konrad entscheidet — kein automatischer Commit.", branch: null },
    ],
    edges: [
      { from: "clarify", to: "plan", label: null },
      { from: "plan", to: "red-green", label: "freigegeben" },
      { from: "plan", to: "tester", label: "parallel" },
      { from: "red-green", to: "gates", label: null },
      { from: "tester", to: "gates", label: null },
      { from: "gates", to: "reviewer", label: null },
      { from: "reviewer", to: "security", label: "falls sensibel" },
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
      { id: "change", label: "Relevante Änderung", description: "Edit/Write unter ~/.claude/{agents,skills,hooks}, settings.json, Workspace-CLAUDE.md/README oder ein git commit in einem Workspace-Repo.", branch: null },
      { id: "mark-dirty", label: "PostToolUse: dashboard-dirty markieren", description: "infra-dashboard-sync.sh setzt einen Marker.", branch: null },
      { id: "stop", label: "Stop-Hook (async)", description: "Läuft am Ende jeder Session/Runde.", branch: null },
      { id: "throttle", label: "Marker + Throttle prüfen", description: "Nur wenn dirty UND letzter Sync ≥10min her.", branch: null },
      { id: "generate", label: "generate-snapshot.ts", description: "Scannt Repos, Agents, Skills, Rules (falls vorhanden), Hooks, lokale TDD-Gate-Logs, CI-Status.", branch: null },
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
      "Wie parallel gearbeitet wird (z. B. tester an der nächsten Slice), " +
      "ohne dass sich Hauptsession und Subagents Dateien überschreiben.",
    steps: [
      { id: "request", label: "Multi-Task-Anfrage", description: "Mehrere unabhängige Slices eines Features oder mehrere Aufgaben gleichzeitig.", branch: null },
      { id: "spawn", label: "Agent-Tool mit isolation: worktree", description: "Jeder code-schreibende Subagent bekommt einen eigenen Arbeitsbaum (oder /worktree für eine zweite Session).", branch: null },
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
