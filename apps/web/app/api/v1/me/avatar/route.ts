import { getCurrentSession } from "@/lib/auth/session";
import { getStorage } from "@/lib/storage";

/**
 * GET /api/v1/me/avatar — the signed-in learner's own profile photo (D-025).
 * Private: there is no way to request another learner's photo.
 */
export async function GET() {
  const session = await getCurrentSession();
  if (!session) return new Response(null, { status: 401 });
  const key = session.user.learner?.avatarKey;
  if (!key) return new Response(null, { status: 404 });
  const body = await getStorage().get(key);
  if (!body) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
