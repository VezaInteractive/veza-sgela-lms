import { headers } from "next/headers";

export const REQUEST_ID_HEADER = "x-request-id";

/** Request ID set by proxy.ts; available in server components, actions and route handlers. */
export async function getRequestId(): Promise<string | undefined> {
  const h = await headers();
  return h.get(REQUEST_ID_HEADER) ?? undefined;
}
