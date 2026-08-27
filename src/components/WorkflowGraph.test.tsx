import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkflowGraph } from "./WorkflowGraph";
import type { WorkflowDiagram } from "@/lib/snapshot-schema";

const diagram: WorkflowDiagram = {
  slug: "sample",
  title: "Sample",
  description: "A sample diagram",
  steps: [
    { id: "a", label: "Start", description: "Where it begins", branch: null },
    { id: "b", label: "Branch left", description: null, branch: null },
    { id: "c", label: "Branch right", description: null, branch: null },
  ],
  edges: [
    { from: "a", to: "b", label: "links" },
    { from: "a", to: "c", label: null },
  ],
};

describe("WorkflowGraph", () => {
  it("renders one box per step", () => {
    render(<WorkflowGraph diagram={diagram} />);
    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("Branch left")).toBeInTheDocument();
    expect(screen.getByText("Branch right")).toBeInTheDocument();
  });

  it("shows a step's description", () => {
    render(<WorkflowGraph diagram={diagram} />);
    expect(screen.getByText("Where it begins")).toBeInTheDocument();
  });

  it("shows an edge's label when present", () => {
    render(<WorkflowGraph diagram={diagram} />);
    expect(screen.getByText("links")).toBeInTheDocument();
  });

  it("renders exactly as many connecting lines as edges", () => {
    const { container } = render(<WorkflowGraph diagram={diagram} />);
    expect(container.querySelectorAll("polyline")).toHaveLength(diagram.edges.length);
  });
});
