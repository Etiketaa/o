import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}}>
        <p>Content</p>
      </Modal>
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders content when open", () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("renders title", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test Title">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
