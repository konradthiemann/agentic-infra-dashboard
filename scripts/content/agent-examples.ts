/**
 * Curated usage examples for global agents (~/.claude/agents/*.md). The
 * name/description/tools/model come live from each agent's frontmatter —
 * this file only supplies the "how would I actually use this" example,
 * which frontmatter doesn't carry.
 */
export const agentExamples: Record<string, string> = {
  orchestrator:
    "Konrad: \"Baue ein Punkte-System für Waldbingo, mit DB-Schema, API und UI.\" " +
    "→ orchestrator zerlegt in Schema (data-analyst) → Tests (tester) → " +
    "Implementierung (implementer) → Review (reviewer) → Docs (docs) und " +
    "sequenziert die Übergaben.",
  planner:
    "Nach einer freigegebenen Spec (specs/punkte-system.md): planner liest sie " +
    "und liefert Datei-für-Datei-Plan inkl. Interfaces & Contracts (z. B. " +
    "`POST /api/scores` Request/Response-Shape), damit tester und implementer " +
    "unabhängig voneinander daran arbeiten können.",
  tester:
    "Aus dem Plan-Kontrakt `POST /api/scores → { points: number }` schreibt " +
    "tester zuerst den fehlschlagenden Request-Test (Rot), ohne die " +
    "Implementierung selbst zu schreiben — bestätigt, dass er aus dem " +
    "richtigen Grund fehlschlägt (404, nicht Syntaxfehler).",
  implementer:
    "Nimmt tester's roten Test für `POST /api/scores`, verifiziert den " +
    "Fehlgrund, implementiert den Endpoint exakt gegen die Plan-Kontrakte, " +
    "bis der Test grün ist, refactored danach.",
  reviewer:
    "Vor dem Merge eines PR: reviewer liest den Diff gegen die " +
    "Akzeptanzkriterien der Spec und meldet reale Defekte (z. B. fehlende " +
    "Validierung, falsche Fehlerbehandlung) — schreibt selbst nichts um.",
  security:
    "Vor dem Ausrollen eines neuen `/api/auth/login`-Endpoints: security prüft " +
    "Auth-Flow, Input-Validierung, Secret-Handling und meldet Findings mit " +
    "Schweregrad und Fix-Vorschlag.",
  "data-analyst":
    "\"Wie migriere ich `users.email` auf `citext` ohne Downtime?\" → " +
    "data-analyst plant die Migration (Doctrine/Prisma), inkl. Reihenfolge " +
    "und Rollback-Pfad, schreibt aber keine Feature-Logik.",
  docs:
    "Nach einem gemergten Feature: docs aktualisiert README/CHANGELOG und " +
    "Docblocks, damit sie mit dem tatsächlichen Verhalten übereinstimmen — " +
    "im bestehenden Ton/Struktur des Projekts.",
};
