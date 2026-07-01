export function formatUnknownError(error: unknown, fallback = "Unknown error") {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "string") return error || fallback;
  if (error === null || error === undefined) return fallback;

  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const keys = Object.keys(record);
    if (keys.length === 0) return fallback;

    const status = record.status;
    const statusText = record.statusText;
    const response = record.response;

    if (typeof status === "number") {
      let responseText = "";
      if (response instanceof ArrayBuffer) {
        responseText = new TextDecoder().decode(response).trim();
      } else if (typeof response === "string") {
        responseText = response.trim();
      }

      const statusLabel = typeof statusText === "string" && statusText.trim()
        ? `${status} ${statusText}`
        : String(status);
      return responseText ? `HTTP ${statusLabel}: ${responseText}` : `HTTP ${statusLabel}`;
    }

    const message = record.message ?? record.error ?? record.reason ?? record.statusText;
    if (typeof message === "string" && message.trim()) return message;
    if (message && typeof message === "object") {
      const nestedFallback = keys.includes("error")
        ? "DICOM loader failed without detailed error data. The MRI instance may be unsupported, missing pixel data, or encoded with an unsupported transfer syntax."
        : fallback;
      return formatUnknownError(message, nestedFallback);
    }

    try {
      const json = JSON.stringify(error, (key, value) =>
        typeof value === "function" ? String(value) : value
      );
      if (json && json !== "{}") return json;
    } catch {
      try {
        const simple: Record<string, string> = {};
        for (const k of keys) {
          const v = (error as Record<string, unknown>)[k];
          simple[k] = typeof v === "object" && v !== null
            ? String(v)
            : typeof v === "string" ? v : JSON.stringify(v);
        }
        const json = JSON.stringify(simple);
        if (json && json !== "{}") return `Cornerstone error: ${json}`;
      } catch {
      }
    }

    if (keys.includes("error")) {
      return "DICOM loader failed without detailed error data. The MRI instance may be unsupported, missing pixel data, or encoded with an unsupported transfer syntax.";
    }

    return fallback;
  }

  return String(error) || fallback;
}
