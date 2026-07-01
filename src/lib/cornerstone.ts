import * as cornerstone from "@cornerstonejs/core";
import { init as initDicomLoader, initializers } from "@cornerstonejs/dicom-image-loader";

let initialized = false;
let initPromise: Promise<void> | null = null;

export async function initCornerstone() {
  if (initPromise) return initPromise;
  if (initialized) return;

  initPromise = (async () => {
    try {
      await cornerstone.init();
    } catch (e) {
      console.error("[cornerstone] core.init() failed:", e);
      initPromise = null;
      throw e;
    }

    try {
      initDicomLoader({
        maxWebWorkers: Math.max(1, (typeof navigator !== "undefined" ? navigator.hardwareConcurrency : 1) - 1),
      });

      const codecs = [
        ["JPEG2000", initializers.JPEG2000],
        ["JPEG-LS", initializers.JPEGLS],
        ["HTJ2K", initializers.HTJ2K],
        ["JPEGBaseline8Bit", initializers.JPEGBaseline8Bit],
        ["JPEGBaseline12Bit", initializers.JPEGBaseline12Bit],
        ["JPEGLossless", initializers.JPEGLossless],
      ] as const;

      for (const [name, init] of codecs) {
        try {
          await init();
          console.log(`[cornerstone] codec ${name} initialized`);
        } catch (e) {
          console.warn(`[cornerstone] codec ${name} init failed:`, e);
        }
      }
    } catch (e) {
      console.error("[cornerstone] dicom-image-loader init failed:", e);
      initPromise = null;
      throw e;
    }

    initialized = true;
    initPromise = null;
  })();

  return initPromise;
}
