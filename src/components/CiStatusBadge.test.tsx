import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CiStatusBadge } from "./CiStatusBadge";

describe("CiStatusBadge", () => {
  it("renders the German label for a successful run", () => {
    render(<CiStatusBadge status="completed" conclusion="success" />);
    expect(screen.getByText("Erfolgreich")).toBeInTheDocument();
  });

  it("renders the German label for a failed run", () => {
    render(<CiStatusBadge status="completed" conclusion="failure" />);
    expect(screen.getByText("Fehlgeschlagen")).toBeInTheDocument();
  });

  it("renders a neutral label when there is no CI status", () => {
    render(<CiStatusBadge status={null} conclusion={null} />);
    expect(screen.getByText("Kein CI-Status")).toBeInTheDocument();
  });
});
