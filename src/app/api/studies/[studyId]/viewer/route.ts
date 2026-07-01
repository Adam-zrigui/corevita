import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentPlan } from "@/lib/plans";
import { getB2Prefix, getDicomMetadata } from "@/lib/storage";
import { formatUnknownError } from "@/lib/format-error";
import { readDicomSortMetadata, type DicomSortMetadata } from "@/lib/dicom-validation";
import { readDicomEquipmentMetadata, type DicomEquipmentMetadata } from "@/lib/dicom-equipment";
import { signDicomToken } from "@/lib/signing";

const EQUIPMENT_PREFIX_BYTES = 4096;

export const runtime = "nodejs";

const naturalCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

const DICOM_METADATA_BYTES = 1024 * 1024;

function compareOptionalNumber(a?: number | null, b?: number | null) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a - b;
}

function compareInstanceOrder(
  a: {
    _seriesIndex: number;
    _fallbackIndex: number;
    storageKey: string;
    instanceNumber: number | null;
    metadata: DicomSortMetadata;
  },
  b: {
    _seriesIndex: number;
    _fallbackIndex: number;
    storageKey: string;
    instanceNumber: number | null;
    metadata: DicomSortMetadata;
  }
) {
  return (
    a._seriesIndex - b._seriesIndex ||
    compareOptionalNumber(a.instanceNumber ?? a.metadata.instanceNumber, b.instanceNumber ?? b.metadata.instanceNumber) ||
    compareOptionalNumber(a.metadata.acquisitionNumber, b.metadata.acquisitionNumber) ||
    compareOptionalNumber(a.metadata.sliceLocation, b.metadata.sliceLocation) ||
    compareOptionalNumber(a.metadata.imagePosition?.[2], b.metadata.imagePosition?.[2]) ||
    naturalCollator.compare(a.storageKey, b.storageKey) ||
    a._fallbackIndex - b._fallbackIndex
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studyId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const planInfo = await getCurrentPlan(session);
    if (planInfo.status === "none") {
      return NextResponse.json({ error: "Subscription required", redirect: "/services/pricing" }, { status: 402 });
    }
    const plan = planInfo.plan;

    const { studyId } = await params;

    const study = await prisma.study.findUnique({
      where: { studyUid: studyId },
      select: {
        studyUid: true,
        patientName: true,
        studyDate: true,
        description: true,
        series: {
          orderBy: [{ seriesNumber: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
          select: {
            id: true,
            seriesUid: true,
            modality: true,
            instanceCount: true,
            instances: {
              orderBy: { instanceNumber: "asc" },
              select: {
                id: true,
                storageDriver: true,
                storageKey: true,
                instanceNumber: true,
              },
            },
          },
        },
      },
    });

    if (!study) {
      return NextResponse.json({ error: "Study not found" }, { status: 404 });
    }

    prisma.study.updateMany({
      where: { studyUid: studyId, status: "PENDING" },
      data: { status: "READING" },
    }).catch(() => {});

    const instances = await Promise.all(
      study.series.flatMap((series, seriesIndex) =>
        series.instances.map(async (instance, fallbackIndex) => {
          let metadata: DicomSortMetadata = {};
          if (instance.storageDriver === "b2") {
            const storedMetadata = await getDicomMetadata(instance.storageKey).catch(() => null);
            if (storedMetadata) {
              metadata = storedMetadata;
            } else {
              const prefix = await getB2Prefix(instance.storageKey, DICOM_METADATA_BYTES).catch(() => null);
              metadata = prefix ? readDicomSortMetadata(prefix) : {};
            }
          }

          return {
            ...instance,
            _seriesIndex: seriesIndex,
            _fallbackIndex: fallbackIndex,
            metadata,
          };
        })
      )
    );

    instances.sort(compareInstanceOrder);

    const b2Instances = instances.filter((i) => i.storageDriver === "b2");

    const ttlSeconds = Number(process.env.DICOM_URL_TTL_SECONDS ?? 900);
    const origin = req.nextUrl.origin;
    const hasSigningSecret = Boolean(process.env.DICOM_SIGNING_SECRET);

    const imageIds = b2Instances
      .map((inst) => {
        const token = signDicomToken(inst.id, ttlSeconds, "default");
        return { instanceId: inst.id, _seriesIndex: inst._seriesIndex, imageId: token ? `wadouri:${origin}/api/dicom/instance/${inst.id}?token=${token}` : null };
      })
      .filter((x) => x.imageId) as { instanceId: string; _seriesIndex: number; imageId: string }[];

    if (b2Instances.length > 0 && !hasSigningSecret) {
      return NextResponse.json(
        { error: "DICOM signing is not configured. Add DICOM_SIGNING_SECRET to .env and restart the dev server." },
        { status: 500 }
      );
    }

    const firstImageBySeries: Record<number, string> = {};
    for (const entry of imageIds) {
      if (firstImageBySeries[entry._seriesIndex] === undefined) {
        firstImageBySeries[entry._seriesIndex] = entry.imageId;
      }
    }

    const equipmentBySeries: Record<number, DicomEquipmentMetadata> = {};
    for (const instance of b2Instances) {
      const si = instance._seriesIndex;
      if (equipmentBySeries[si] !== undefined) continue;
      const prefix = await getB2Prefix(instance.storageKey, EQUIPMENT_PREFIX_BYTES).catch(() => null);
      if (prefix) {
        equipmentBySeries[si] = readDicomEquipmentMetadata(prefix);
      } else {
        equipmentBySeries[si] = {};
      }
    }

    const seriesWithThumbnail = study.series.map((s, i) => ({
      id: s.id,
      seriesUid: s.seriesUid,
      modality: s.modality,
      instanceCount: s.instanceCount,
      firstImageId: firstImageBySeries[i] ?? null,
      equipment: equipmentBySeries[i] ?? {},
    }));

    return NextResponse.json(
      {
        study: {
          studyUid: study.studyUid,
          patientName: study.patientName,
          studyDate: study.studyDate,
          description: study.description,
          series: seriesWithThumbnail,
        },
        imageIds: imageIds.map((e) => e.imageId),
        total: imageIds.length,
        plan,
      },
      {
        headers: {
          "cache-control": "private, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: formatUnknownError(error, "Failed to load study") },
      { status: 500 }
    );
  }
}
