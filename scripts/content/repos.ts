/**
 * Curated per-repo metadata that can't be reliably scanned (role, stack,
 * deploy target). Keyed by directory name under ~/Softwareentwicklung.
 * Anything scannable (last commit, CI status, whether it has its own
 * .claude/) is filled in live by scripts/generate-snapshot.ts.
 */
export interface CuratedRepo {
  role: string;
  stack: string[];
  deployTarget: string | null;
}

export const curatedRepos: Record<string, CuratedRepo> = {
  Doewe: {
    role: "Familien-Finanz-App (Referenz-Setup, eigene .claude/)",
    stack: ["Next.js 14", "TypeScript", "Prisma", "PostgreSQL", "Railway"],
    deployTarget: "Railway",
  },
  Pokekon: {
    role: "Full-Stack-App",
    stack: ["TypeScript", "eigene API"],
    deployTarget: null,
  },
  "Pok-mon-TCG-Prize-Checker": {
    role: "App",
    stack: ["React", "Vite", "Supabase", "TypeScript"],
    deployTarget: null,
  },
  portfolio2: {
    role: "Portfolio-Frontend",
    stack: ["Vue", "Nuxt", "SASS"],
    deployTarget: null,
  },
  bilderraetsel: {
    role: "App",
    stack: ["Node", "DB (seed)"],
    deployTarget: null,
  },
  "Foto-Challenge": {
    role: "Foto-Challenge-App (\"Knips\") — live, Nixpacks-Deploy",
    stack: ["Node"],
    deployTarget: "GitHub Pages / Nixpacks",
  },
  Waldbingo: {
    role: "App",
    stack: ["TypeScript"],
    deployTarget: null,
  },
  "control-plane": {
    role: "Admin/Ops-Backend — aggregiert Einnahmen, GitHub-Issues und App-Analytics für Konrads Apps",
    stack: ["PHP 8.5", "Symfony 7", "Doctrine ORM", "PostgreSQL", "Symfony UX", "FrankenPHP"],
    deployTarget: "Railway",
  },
  "geburtstag-karaoke": {
    role: "Einmaliges Event-Projekt (Karaoke-Slideshow)",
    stack: ["Static HTML/JS"],
    deployTarget: null,
  },
  "gmail-mcp": {
    role: "Lokaler, safe-by-design Gmail-MCP-Server für Claude Code (kein permanentes Löschen, kein Senden)",
    stack: ["Node", "MCP"],
    deployTarget: "lokal (kein Deploy)",
  },
  "notes-mcp": {
    role: "Lokaler, safe-by-design Apple-Notes-MCP-Server für Claude Code (JXA/AppleScript)",
    stack: ["Node", "MCP", "JXA"],
    deployTarget: "lokal (kein Deploy)",
  },
  "agentic-infra-dashboard": {
    role: "Dieses Dashboard selbst — Meta-Übersicht der Agentik-Infrastruktur",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    deployTarget: "Railway",
  },
};
