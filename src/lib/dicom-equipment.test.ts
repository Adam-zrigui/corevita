import { describe, it, expect } from "vitest";
import { readDicomEquipmentMetadata } from "./dicom-equipment";

describe("readDicomEquipmentMetadata", () => {
  it("returns empty object for empty buffer", () => {
    const result = readDicomEquipmentMetadata(Buffer.alloc(0));
    expect(result).toEqual({});
  });

  it("returns empty object for non-DICOM buffer", () => {
    const result = readDicomEquipmentMetadata(Buffer.from("not DICOM", "utf-8"));
    expect(result).toEqual({});
  });

  it("returns empty object for buffer that is too small", () => {
    const result = readDicomEquipmentMetadata(Buffer.alloc(10));
    expect(result).toEqual({});
  });

  it("returns empty object for invalid DICOM data", () => {
    const result = readDicomEquipmentMetadata(Buffer.alloc(512));
    expect(result).toEqual({});
  });
});
