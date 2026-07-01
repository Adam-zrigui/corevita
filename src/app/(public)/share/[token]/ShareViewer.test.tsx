import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ShareViewer } from "./ShareViewer";

vi.mock("@/components/viewer/ViewerShell", () => ({
  ViewerShell: ({ imageIds, study, headerExtra }: any) => (
    <div data-testid="viewer-shell">
      <span data-testid="image-count">{imageIds.length}</span>
      <span data-testid="patient-name">{study.patientName}</span>
      <div data-testid="header-extra">{headerExtra}</div>
    </div>
  ),
}));

const mockStudy = {
  studyUid: "1.2.3",
  patientName: "John Doe",
  patientId: "P001",
  modality: "MR",
  studyDate: "2024-01-15",
  description: "Brain MRI",
  slices: 100,
  series: [
    { id: "s1", seriesUid: "1.2.3.1", modality: "MR", instanceCount: 50, seriesNumber: 1 },
    { id: "s2", seriesUid: "1.2.3.2", modality: "MR", instanceCount: 50, seriesNumber: 2 },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ShareViewer", () => {
  it("shows loading state initially", () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as any;
    render(<ShareViewer token="abc" study={mockStudy} allowDownload={false} expiresAt={new Date(Date.now() + 86400000)} />);
    expect(screen.getByText("Loading shared study...")).toBeInTheDocument();
  });

  it("loads images and renders viewer on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        plan: "starter",
        imageIds: ["wadouri:https://example.com/img/1?token=t1", "wadouri:https://example.com/img/2?token=t2"],
        instances: [],
      }),
    } as Response);

    render(<ShareViewer token="abc" study={mockStudy} allowDownload={false} expiresAt={new Date(Date.now() + 86400000)} />);

    await waitFor(() => {
      expect(screen.getByTestId("viewer-shell")).toBeInTheDocument();
    });
    expect(screen.getByTestId("image-count")).toHaveTextContent("2");
  });

  it("shows error state when API fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Share link not found" }),
    } as Response);

    render(<ShareViewer token="bad" study={mockStudy} allowDownload={false} expiresAt={new Date(Date.now() + 86400000)} />);

    expect(await screen.findByText("Failed to Load")).toBeInTheDocument();
  });

  it("shows empty state when no images", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ plan: "starter", imageIds: [], instances: [] }),
    } as Response);

    render(<ShareViewer token="abc" study={mockStudy} allowDownload={false} expiresAt={new Date(Date.now() + 86400000)} />);

    await waitFor(() => {
      expect(screen.getAllByText("50 images").length).toBe(2);
    });
  });

  it("shows download button when allowDownload is true", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        plan: "starter",
        imageIds: ["wadouri:https://example.com/img/1?token=t1"],
        instances: [{ id: "i1", signedUrl: "https://example.com/api/dicom/instance/i1?token=t1" }],
      }),
    } as Response);

    render(<ShareViewer token="abc" study={mockStudy} allowDownload={true} expiresAt={new Date(Date.now() + 86400000)} />);

    await waitFor(() => {
      expect(screen.getByTestId("header-extra")).toBeInTheDocument();
    });
    expect(screen.getByTestId("header-extra").textContent).toMatch(/Download/);
  });

  it("hides download button when allowDownload is false", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        plan: "starter",
        imageIds: ["wadouri:https://example.com/img/1?token=t1"],
        instances: [{ id: "i1", signedUrl: "https://example.com/api/dicom/instance/i1?token=t1" }],
      }),
    } as Response);

    render(<ShareViewer token="abc" study={mockStudy} allowDownload={false} expiresAt={new Date(Date.now() + 86400000)} />);

    await waitFor(() => {
      expect(screen.getByTestId("viewer-shell")).toBeInTheDocument();
    });
    expect(screen.getByTestId("header-extra").textContent).not.toMatch(/Download/);
  });
});
