// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fixtureSnapshot from "../../fixtures/snapshot.sample.json";

// The real `server-only` package throws outside Next's RSC bundler condition
// (which Vitest doesn't set) — stub it so this module can be unit-tested.
vi.mock("server-only", () => ({}));
const { getSnapshot } = await import("./get-snapshot");

describe("getSnapshot", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns the parsed snapshot on a successful fetch", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fixtureSnapshot,
    }) as unknown as typeof fetch;

    const snapshot = await getSnapshot();
    expect(snapshot?.repos.length).toBe(fixtureSnapshot.repos.length);
  });

  it("falls back to the fixture in development when the fetch fails", async () => {
    vi.stubEnv("NODE_ENV", "development");
    global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    const snapshot = await getSnapshot();
    expect(snapshot?.repos.length).toBe(fixtureSnapshot.repos.length);
  });

  it("returns null in production when the fetch fails, instead of stale fixture data", async () => {
    vi.stubEnv("NODE_ENV", "production");
    global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    const snapshot = await getSnapshot();
    expect(snapshot).toBeNull();
  });

  it("returns null in production when the response fails schema validation", async () => {
    vi.stubEnv("NODE_ENV", "production");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ not: "a valid snapshot" }),
    }) as unknown as typeof fetch;

    const snapshot = await getSnapshot();
    expect(snapshot).toBeNull();
  });
});
