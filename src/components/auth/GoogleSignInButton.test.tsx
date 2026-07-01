import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GoogleSignInButton from "./GoogleSignInButton";

vi.mock("@/lib/firebase/auth", () => ({
  signIn: vi.fn(),
  GoogleAuthProvider: "google-provider",
}));

import { signIn } from "@/lib/firebase/auth";

beforeEach(() => {
  vi.clearAllMocks();
  delete (window as any).location;
  window.location = { href: "", search: "" } as any;
});

describe("GoogleSignInButton", () => {
  it("renders sign-in button", () => {
    render(<GoogleSignInButton />);
    expect(screen.getByTestId("google-signin")).toHaveTextContent("Sign in with Google");
  });

  it("calls signIn, creates session, and redirects on success", async () => {
    const fakeUser = { getIdToken: vi.fn().mockResolvedValue("tok") };
    vi.mocked(signIn).mockResolvedValue(fakeUser as any);
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);

    render(<GoogleSignInButton />);
    fireEvent.click(screen.getByTestId("google-signin"));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("google-provider");
      expect(fetch).toHaveBeenCalledWith("/api/auth/session", expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("tok"),
      }));
      expect(window.location.href).toBe("/dashboard");
    });
  });

  it("shows error when session API fails", async () => {
    const fakeUser = { getIdToken: vi.fn().mockResolvedValue("tok") };
    vi.mocked(signIn).mockResolvedValue(fakeUser as any);
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401, json: () => Promise.resolve({ error: "Unauthorized" }) } as any);

    render(<GoogleSignInButton />);
    fireEvent.click(screen.getByTestId("google-signin"));

    await waitFor(() => {
      expect(screen.getByTestId("google-error")).toHaveTextContent("Unauthorized");
    });
  });

  it("handles signIn returning null", async () => {
    vi.mocked(signIn).mockResolvedValue(null);
    render(<GoogleSignInButton />);
    fireEvent.click(screen.getByTestId("google-signin"));

    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
