import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SnapshotUnavailable } from "./SnapshotUnavailable";

describe("SnapshotUnavailable", () => {
  it("shows a calm, German 'not available yet' message", () => {
    render(<SnapshotUnavailable />);
    expect(screen.getByText(/snapshot noch nicht verfügbar/i)).toBeInTheDocument();
  });
});
