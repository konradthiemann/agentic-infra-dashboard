export const hookPurposes: Record<string, string> = {
  "git-safety.sh":
    "Blockiert riskante Git-Kommandos (force-push, push auf main/master, " +
    "reset --hard, clean -f, Commit einer echten .env) im Workspace-Scope.",
  "tdd-gate.sh":
    "Blockiert git commit ohne grünen Testlauf und gh pr create ohne " +
    "grüne Lint-/Typecheck-/Test-Gates seit der letzten Code-Änderung.",
  "stop-notify.sh": "Benachrichtigt Konrad, wenn eine Session/Runde endet.",
  "infra-dashboard-sync.sh":
    "Hält dieses Dashboard aktuell: bei relevanten Änderungen generiert und " +
    "pusht es einen neuen Snapshot auf den data-Branch (siehe Workflow " +
    "\"Dashboard-Sync\").",
};
