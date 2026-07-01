import { createHmac, timingSafeEqual } from "crypto";

type TokenPayload = {
  id: string;
  tenantId?: string;
  exp: number;
};

function base64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function base64urlJson(obj: object) {
  return base64url(JSON.stringify(obj));
}

export function signDicomToken(id: string, ttlSeconds = 900, tenantId?: string) {
  const secret = process.env.DICOM_SIGNING_SECRET;
  if (!secret) return null;
  const payload: TokenPayload = {
    id,
    tenantId,
    exp: Date.now() + ttlSeconds * 1000,
  };
  const body = base64urlJson(payload);
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyDicomToken(token: string | null) {
  const secret = process.env.DICOM_SIGNING_SECRET;
  if (!secret || !token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
    if (!payload.id || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
