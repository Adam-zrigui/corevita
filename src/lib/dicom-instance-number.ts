import dicomParser from "dicom-parser";

export function parseInstanceNumber(buffer: Buffer): number | null {
  try {
    const dataSet = dicomParser.parseDicom(new Uint8Array(buffer), {
      untilTag: "x7fe00010",
    });
    const elem = dataSet.elements.x00200013;
    if (!elem) return null;
    return dataSet.intString("x00200013") ?? null;
  } catch {
    return null;
  }
}

export function parseSeriesNumber(buffer: Buffer): number | null {
  try {
    const dataSet = dicomParser.parseDicom(new Uint8Array(buffer), {
      untilTag: "x7fe00010",
    });
    const elem = dataSet.elements.x00200011;
    if (!elem) return null;
    return dataSet.intString("x00200011") ?? null;
  } catch {
    return null;
  }
}

export function parseSeriesUid(buffer: Buffer): string | null {
  try {
    const dataSet = dicomParser.parseDicom(new Uint8Array(buffer), {
      untilTag: "x7fe00010",
    });
    return dataSet.string("x0020000e") ?? null;
  } catch {
    return null;
  }
}
