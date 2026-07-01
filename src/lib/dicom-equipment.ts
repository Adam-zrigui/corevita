import dicomParser from "dicom-parser";

export type DicomEquipmentMetadata = {
  manufacturer?: string | null;
  manufacturerModelName?: string | null;
  stationName?: string | null;
  institutionName?: string | null;
  institutionalDepartmentName?: string | null;
  deviceSerialNumber?: string | null;
  softwareVersions?: string | null;
};

export function readDicomEquipmentMetadata(buffer: Buffer): DicomEquipmentMetadata {
  try {
    const dataSet = dicomParser.parseDicom(new Uint8Array(buffer), {
      untilTag: "x7fe00010",
    });

    return {
      manufacturer: dataSet.string("x00080070")?.trim() || null,
      manufacturerModelName: dataSet.string("x00081090")?.trim() || null,
      stationName: dataSet.string("x00081010")?.trim() || null,
      institutionName: dataSet.string("x00080080")?.trim() || null,
      institutionalDepartmentName: dataSet.string("x00081040")?.trim() || null,
      deviceSerialNumber: dataSet.string("x00181000")?.trim() || null,
      softwareVersions: dataSet.string("x00181020")?.trim() || null,
    };
  } catch {
    return {};
  }
}
