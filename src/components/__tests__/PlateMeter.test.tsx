import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlateMeter } from "../PlateMeter";

describe("PlateMeter", () => {
  it("renders occupancy ratio", () => {
    render(<PlateMeter ocupados={5} total={10} />);
    expect(screen.getByText("5/10")).toBeInTheDocument();
  });

  it("shows full state when ocupados >= total", () => {
    render(<PlateMeter ocupados={10} total={10} />);
    expect(screen.getByText("10/10")).toBeInTheDocument();
  });

  it("renders correct number of segments", () => {
    const { container } = render(<PlateMeter ocupados={3} total={5} />);
    const segments = container.querySelectorAll("[style*='width: 5px']");
    expect(segments.length).toBe(5);
  });
});
