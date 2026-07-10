import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pill } from "../Pill";

describe("Pill", () => {
  it("renders children text", () => {
    render(<Pill active={false} onClick={() => {}}>Lun</Pill>);
    expect(screen.getByText("Lun")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Pill active={false} onClick={onClick}>Lun</Pill>);
    fireEvent.click(screen.getByText("Lun"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
