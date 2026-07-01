import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ResetPasswordForm } from "./ResetPasswordForm";

vi.mock("@/lib/firebase/auth", () => ({
  resetPassword: vi.fn(),
}));

import { resetPassword } from "@/lib/firebase/auth";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ResetPasswordForm", () => {
  it("renders email field and submit button", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByTestId("reset-submit")).toHaveTextContent("Send reset link");
  });

  it("shows validation error on empty submit", async () => {
    render(<ResetPasswordForm />);
    fireEvent.click(screen.getByTestId("reset-submit"));
    expect(await screen.findByText("Please enter your email address.")).toBeInTheDocument();
  });

  it("calls resetPassword and shows success message", async () => {
    vi.mocked(resetPassword).mockResolvedValue(undefined);
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByPlaceholderText("Email address"), { target: { value: "a@b.com" } });
    fireEvent.click(screen.getByTestId("reset-submit"));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith("a@b.com");
    });
    expect(screen.getByTestId("reset-sent")).toHaveTextContent("Check your email");
    expect(screen.getByTestId("reset-submit")).toHaveTextContent("Email sent");
  });

  it("shows error when resetPassword fails", async () => {
    vi.mocked(resetPassword).mockRejectedValue(new Error("User not found"));
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByPlaceholderText("Email address"), { target: { value: "a@b.com" } });
    fireEvent.click(screen.getByTestId("reset-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("reset-error")).toHaveTextContent("User not found");
    });
  });

  it("disables inputs after successful send", async () => {
    vi.mocked(resetPassword).mockResolvedValue(undefined);
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByPlaceholderText("Email address"), { target: { value: "a@b.com" } });
    fireEvent.click(screen.getByTestId("reset-submit"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Email address")).toBeDisabled();
      expect(screen.getByTestId("reset-submit")).toBeDisabled();
    });
  });
});
