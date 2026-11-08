import * as Sentry from "@sentry/nextjs";

/** Sentry is enabled only when SENTRY_DSN is set (see .env.example). */
export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}

export const onRequestError = Sentry.captureRequestError;
