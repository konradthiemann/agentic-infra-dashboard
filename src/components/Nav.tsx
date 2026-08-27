"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatRelativeDate } from "@/lib/format";

const SECTIONS = [
  { href: "/", label: "Übersicht" },
  { href: "/repos", label: "Repos" },
  { href: "/agents-skills", label: "Agents & Skills" },
  { href: "/workflows", label: "Workflows" },
  { href: "/monitoring", label: "Monitoring" },
] as const;

export interface NavProps {
  generatedAt: string | null;
}

export function Nav({ generatedAt }: NavProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-x-1 gap-y-1" aria-label="Hauptnavigation">
          {SECTIONS.map((section) => {
            const isActive = pathname === section.href;
            return (
              <Link
                key={section.href}
                href={section.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
                  (isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100")
                }
              >
                {section.label}
              </Link>
            );
          })}
        </nav>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {generatedAt ? (
            <>Snapshot aktualisiert: {formatRelativeDate(generatedAt)}</>
          ) : (
            <>Noch kein Snapshot verfügbar</>
          )}
        </p>
      </div>
    </header>
  );
}
