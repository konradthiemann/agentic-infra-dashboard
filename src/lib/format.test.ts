import { describe, it, expect } from "vitest";
import { formatRelativeDate, ciStatusColor, ciStatusLabel } from "./format";

describe("formatRelativeDate", () => {
  const now = new Date("2026-08-27T12:00:00Z");

  it("returns 'gerade eben' for timestamps less than a minute ago", () => {
    expect(formatRelativeDate("2026-08-27T11:59:30Z", now)).toBe("gerade eben");
  });

  it("formats minutes ago", () => {
    expect(formatRelativeDate("2026-08-27T11:45:00Z", now)).toBe("vor 15 Minuten");
  });

  it("formats hours ago", () => {
    expect(formatRelativeDate("2026-08-27T09:00:00Z", now)).toBe("vor 3 Stunden");
  });

  it("formats days ago", () => {
    expect(formatRelativeDate("2026-08-24T12:00:00Z", now)).toBe("vor 3 Tagen");
  });

  it("falls back to a plain date beyond 30 days", () => {
    expect(formatRelativeDate("2026-01-01T12:00:00Z", now)).toBe("01.01.2026");
  });
});

describe("ciStatusColor", () => {
  it("returns green for a completed, successful run", () => {
    expect(ciStatusColor("completed", "success")).toBe("green");
  });

  it("returns red for a completed, failed run", () => {
    expect(ciStatusColor("completed", "failure")).toBe("red");
  });

  it("returns red for a completed, cancelled run", () => {
    expect(ciStatusColor("completed", "cancelled")).toBe("red");
  });

  it("returns gray for a run still in progress", () => {
    expect(ciStatusColor("in_progress", null)).toBe("gray");
  });

  it("returns gray for a completed run without a conclusion", () => {
    expect(ciStatusColor("completed", null)).toBe("gray");
  });

  it("returns gray when there is no CI status at all", () => {
    expect(ciStatusColor(null, null)).toBe("gray");
  });
});

describe("ciStatusLabel", () => {
  it("labels a successful run", () => {
    expect(ciStatusLabel("completed", "success")).toBe("Erfolgreich");
  });

  it("labels a failed run", () => {
    expect(ciStatusLabel("completed", "failure")).toBe("Fehlgeschlagen");
  });

  it("labels a run in progress", () => {
    expect(ciStatusLabel("in_progress", null)).toBe("Läuft");
  });

  it("labels a missing CI status", () => {
    expect(ciStatusLabel(null, null)).toBe("Kein CI-Status");
  });
});
