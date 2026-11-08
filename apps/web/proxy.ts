import { NextResponse, type NextRequest } from "next/server";

const HEADER = "x-request-id";
const VALID = /^[A-Za-z0-9._-]{8,64}$/;

/** Next 16 proxy (formerly middleware): attach a request ID to every request and response. */
export function proxy(request: NextRequest) {
  const incoming = request.headers.get(HEADER);
  const requestId = incoming && VALID.test(incoming) ? incoming : crypto.randomUUID();

  const forwarded = new Headers(request.headers);
  forwarded.set(HEADER, requestId);

  const response = NextResponse.next({ request: { headers: forwarded } });
  response.headers.set(HEADER, requestId);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*[.](?:png|jpg|svg|webp|glb|usdz)$).*)"],
};
