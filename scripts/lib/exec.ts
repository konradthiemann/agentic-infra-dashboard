import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/** Runs a command, returns trimmed stdout, or null if it fails/exits non-zero. */
export async function tryRun(cmd: string, args: string[], cwd?: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync(cmd, args, { cwd, timeout: 15_000 });
    return stdout.trim();
  } catch {
    return null;
  }
}
