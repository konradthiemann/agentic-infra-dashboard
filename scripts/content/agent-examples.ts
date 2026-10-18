/**
 * Curated usage examples for global agents (~/.claude/agents/*.md). The
 * name/description/tools/model come live from each agent's frontmatter —
 * this file only supplies the "how would I actually use this" example,
 * which frontmatter doesn't carry.
 */
export const agentExamples: Record<string, string> = {
  tester:
    "Feature mit zwei unabhängigen Slices (API + UI): Während die Hauptsession " +
    "`POST /api/scores` test-first umsetzt, schreibt tester im eigenen Worktree " +
    "die fehlschlagenden Tests für die UI-Slice aus deren Akzeptanzkriterien " +
    "und bestätigt Rot aus dem richtigen Grund — Produktionslogik schreibt er nie.",
  reviewer:
    "Nach grünen Gates im Feature-Ablauf: reviewer prüft den Diff mit frischem " +
    "Kontext gegen die Akzeptanzkriterien und meldet reale Defekte (z. B. " +
    "fehlende Validierung, falsche Fehlerbehandlung) — schreibt selbst nichts um.",
  security:
    "Zusätzlich zum reviewer, wenn ein Diff Auth, Nutzereingaben, Geld, Secrets " +
    "oder externe APIs berührt — z. B. ein neuer `/api/auth/login`-Endpoint: security prüft " +
    "Auth-Flow, Input-Validierung, Secret-Handling und meldet Findings mit " +
    "Schweregrad und Fix-Vorschlag.",
  "data-analyst":
    "\"Wie migriere ich `users.email` auf `citext` ohne Downtime?\" → " +
    "data-analyst plant die Migration (Doctrine/Prisma), inkl. Reihenfolge " +
    "und Rollback-Pfad, schreibt aber keine Feature-Logik.",
  docs:
    "Nach einem Feature mit großem Doku-Umfang: docs aktualisiert README/CHANGELOG und " +
    "Docblocks, damit sie mit dem tatsächlichen Verhalten übereinstimmen — " +
    "im bestehenden Ton/Struktur des Projekts.",
};
