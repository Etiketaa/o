import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusChip } from "../StatusChip";

describe("StatusChip", () => {
  it("renders ACTIVO for activo state", () => {
    render(<StatusChip estado="activo" />);
    expect(screen.getByText("ACTIVO")).toBeInTheDocument();
  });

  it("renders VENCIDO for vencido state", () => {
    render(<StatusChip estado="vencido" />);
    expect(screen.getByText("VENCIDO")).toBeInTheDocument();
  });

  it("renders PAGADO for pagado state", () => {
    render(<StatusChip estado="pagado" />);
    expect(screen.getByText("PAGADO")).toBeInTheDocument();
  });

  it("renders PENDIENTE for pendiente state", () => {
    render(<StatusChip estado="pendiente" />);
    expect(screen.getByText("PENDIENTE")).toBeInTheDocument();
  });
});
