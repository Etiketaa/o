import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "../Avatar";

describe("Avatar", () => {
  it("renders initials from name", () => {
    render(<Avatar nombre="Martina Suárez" />);
    expect(screen.getByText("MS")).toBeInTheDocument();
  });

  it("renders first character for single name", () => {
    render(<Avatar nombre="Franco" />);
    expect(screen.getByText("F")).toBeInTheDocument();
  });
});
