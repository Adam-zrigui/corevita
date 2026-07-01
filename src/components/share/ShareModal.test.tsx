import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ShareModal } from "./ShareModal";

const mockWriteText = vi.fn();
Object.assign(navigator, { clipboard: { writeText: mockWriteText } });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ShareModal", () => {
  const defaultProps = { studyId: "study-1", studyUid: "1.2.3", onClose: vi.fn(), plan: "starter" as const };

  it("renders the modal with form fields", () => {
    render(<ShareModal {...defaultProps} />);
    expect(screen.getByTestId("share-modal")).toBeInTheDocument();
    expect(screen.getByText("Share Study")).toBeInTheDocument();
    expect(screen.getByText("Generate Share Link")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<ShareModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("share-modal-close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows 1 week as default expiry", () => {
    render(<ShareModal {...defaultProps} />);
    const select = screen.getByDisplayValue("1 week");
    expect(select).toBeInTheDocument();
  });

  it("disables longer expiry options for starter plan", () => {
    render(<ShareModal {...defaultProps} plan="starter" />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.options.length).toBe(1);
  });

  it("shows longer expiry options for pro plan", () => {
    render(<ShareModal {...defaultProps} plan="pro" />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.options.length).toBe(3);
  });

  it("shows longer expiry options for enterprise plan", () => {
    render(<ShareModal {...defaultProps} plan="enterprise" />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.options.length).toBe(3);
  });

  it("calls API and shows share URL on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: "https://corevita.app/share/abc123", token: "abc123" }),
    } as Response);

    const onShare = vi.fn();
    render(<ShareModal {...defaultProps} onShare={onShare} />);
    fireEvent.click(screen.getByTestId("share-generate"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/share", expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("study-1"),
      }));
    });
    expect(await screen.findByDisplayValue(/share\/abc123/)).toBeInTheDocument();
    expect(onShare).toHaveBeenCalled();
  });

  it("shows error when share API fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Rate limited" }),
    } as Response);

    render(<ShareModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("share-generate"));

    expect(await screen.findByText("Rate limited")).toBeInTheDocument();
  });

  it("copies share URL to clipboard", async () => {
    mockWriteText.mockResolvedValue(undefined);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: "https://corevita.app/share/abc123", token: "abc123" }),
    } as Response);

    render(<ShareModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("share-generate"));
    expect(await screen.findByDisplayValue(/share\/abc123/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("share-copy"));
    expect(mockWriteText).toHaveBeenCalledWith("https://corevita.app/share/abc123");
  });

  it("revoke clears the URL and shows generate button again", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: "https://corevita.app/share/abc123", token: "abc123" }),
    } as Response);

    render(<ShareModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("share-generate"));
    expect(await screen.findByDisplayValue(/share\/abc123/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Revoke & generate new"));
    expect(screen.queryByDisplayValue(/share\/abc123/)).not.toBeInTheDocument();
    expect(screen.getByText("Generate Share Link")).toBeInTheDocument();
  });

  it("allows password and download checkbox interaction", () => {
    render(<ShareModal {...defaultProps} />);

    const passwordInput = screen.getByPlaceholderText("Leave blank for no password");
    fireEvent.change(passwordInput, { target: { value: "mypass" } });
    expect(passwordInput).toHaveValue("mypass");

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
