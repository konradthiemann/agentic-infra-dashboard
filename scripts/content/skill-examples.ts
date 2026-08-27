/**
 * Curated usage examples for global skills (~/.claude/skills/<name>/SKILL.md).
 * name/description come live from each SKILL.md's frontmatter.
 */
export const skillExamples: Record<string, string> = {
  commit:
    "Konrad: \"commite das\" → prüft git status/diff, teilt in logische " +
    "Schritte, formatiert als `feat(scores): add points endpoint` mit " +
    "Goal/Why/How-Body und Co-Author-Zeile.",
  "email-brief":
    "Konrad: \"/email-brief\" (oder \"/email-brief 14d\", \"/email-brief " +
    "bewerbungen\") → liefert priorisierte Gmail-Zusammenfassung: " +
    "Handlungsbedarf, Schule, Bewerbungen, Verkäufe/Signups, Belege — " +
    "read-only, nichts wird gesendet oder gelöscht.",
  feature:
    "Konrad: \"baue ein Login mit Magic-Link\" → verkettet automatisch " +
    "Spec → Plan → tester (Rot) → implementer (Grün) → Quality-Gates → " +
    "Review → ggf. Docs, statt jeden Schritt einzeln anzustoßen.",
  "new-app":
    "Konrad: \"neues Projekt für einen Rezept-Planer\" → legt " +
    "`~/Softwareentwicklung/rezept-planer` an mit README, .gitignore, " +
    "CLAUDE.md, CI-Workflow und GitHub-Repo — Setup wie bei bestehenden Apps.",
  spec:
    "Konrad: \"/spec Punkte-System für Waldbingo\" → fragt gezielt nach " +
    "Zielgruppe/Randbedingungen, schreibt `specs/punkte-system.md` mit " +
    "Akzeptanzkriterien, legt Konrad zur Freigabe vor, bevor geplant wird.",
  worktree:
    "Konrad will parallel an Feature A und Bugfix B arbeiten → " +
    "`worktree.sh new fix/scores-rounding` legt einen zweiten Arbeitsbaum " +
    "unter `.worktrees/` an, ohne den Feature-A-Branch anzufassen.",
  "wrap-session":
    "Konrad: \"das wars für heute\" → prüft offene Änderungen/PRs je Repo, " +
    "räumt Worktrees/Scratch-Dateien auf, zieht neue Erkenntnisse in " +
    "CLAUDE.md/Memory nach und fasst zusammen, was als Nächstes ansteht.",
};
