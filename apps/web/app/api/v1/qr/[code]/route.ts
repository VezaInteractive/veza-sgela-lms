import QRCode from "qrcode";
import { normaliseClaimCode } from "@sgela/contracts";
import { apiError, appUrl } from "@/lib/http";

/** GET /api/v1/qr/:code: PNG QR for a claim URL (kiosk screen and printed cards). */
export async function GET(_request: Request, ctx: RouteContext<"/api/v1/qr/[code]">) {
  const { code: raw } = await ctx.params;
  const code = normaliseClaimCode(raw.replace(/[.]png$/i, ""));
  if (!code) return apiError(400, "INVALID_CODE", "Not a claim code");
  const png = await QRCode.toBuffer(appUrl() + "/claim/" + code, { width: 480, margin: 2 });
  return new Response(new Uint8Array(png), {
    headers: { "content-type": "image/png", "cache-control": "public, max-age=86400, immutable" },
  });
}
