import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeriesThumbnail } from "./SeriesThumbnail";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SeriesThumbnail", () => {
  it("renders a canvas element", () => {
    render(<SeriesThumbnail imageId="wadouri:https://example.com/img" />);
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });
});
