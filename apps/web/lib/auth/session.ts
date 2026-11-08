import { cache } from "react";
import { cookies, headers } from "next/headers";
import { getDb, type PrismaClient } from "@sgela/db";
import { hashIp, randomToken, sha256 } from "@/lib/crypto";
import { clientIpFrom } from "@/lib/http";

/**
 * Database sessions (D-012). The cookie holds a random token; the DB stores only its sha256.
 * Trusted device = 30 days (L-ON-10); otherwise a browser-session cookie backed by 12 h.
 */
export const SESSION_COOKIE = "sgela_session";
export const TRUSTED_SESSION_MS = 30 * 24 * 60 * 60_000;
export const SHORT_SESSION_MS = 12 * 60 * 60_000;

export interface NewSession {
  token: string;
  expiresAt: Date;
}

export async function createDbSession(
  userId: string,
  opts: { trusted: boolean; userAgent?: string | null; ip?: string | null; now?: Date },
  db: PrismaClient = getDb(),
): Promise<NewSession> {
  const now = opts.now ?? new Date();
  const token = randomToken(32);
  const expiresAt = new Date(
    now.getTime() + (opts.trusted ? TRUSTED_SESSION_MS : SHORT_SESSION_MS),
  );
  await db.authSession.create({
    data: {
      userId,
      sessionToken: sha256(token),
      expiresAt,
      trustedDevice: opts.trusted,
      userAgent: opts.userAgent?.slice(0, 255) ?? null,
      ipHash: opts.ip ? hashIp(opts.ip) : null,
    },
  });
  return { token, expiresAt };
}

/** Create a session and set the cookie. Call from server actions / route handlers only. */
export async function startSession(userId: string, trusted: boolean) {
  const h = await headers();
  const session = await createDbSession(userId, {
    trusted,
    userAgent: h.get("user-agent"),
    ip: clientIpFrom(h),
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production" && !(process.env.APP_URL ?? "").startsWith("http://"),
    sameSite: "lax",
    path: "/",
    ...(trusted ? { expires: session.expiresAt } : {}),
  });
  await getDb().user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
}

export async function findSessionByToken(
  token: string,
  now = new Date(),
  db: PrismaClient = getDb(),
) {
  const session = await db.authSession.findUnique({
    where: { sessionToken: sha256(token) },
    include: { user: { include: { learner: { include: { guardian: true } } } } },
  });
  if (!session || session.expiresAt <= now) return null;
  if (session.user.status !== "ACTIVE" || session.user.deletedAt) return null;
  return session;
}

export type CurrentSession = NonNullable<Awaited<ReturnType<typeof findSessionByToken>>>;

/** Current session for this request (memoised per request). */
export const getCurrentSession = cache(async (): Promise<CurrentSession | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return findSessionByToken(token);
});

export async function endCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await getDb().authSession.deleteMany({ where: { sessionToken: sha256(token) } });
  store.delete(SESSION_COOKIE);
}

/** "Log out everywhere" (L-ON-10): revoke every session for the user. */
export async function endAllSessions(userId: string, db: PrismaClient = getDb()) {
  const { count } = await db.authSession.deleteMany({ where: { userId } });
  return count;
}
