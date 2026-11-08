"use client";

import { useTranslations } from "next-intl";

/** Localised error text for an `errors.*` key. */
export function useErrorText() {
  const t = useTranslations("errors");
  return (key: string | undefined, params?: Record<string, string | number>) =>
    key ? t(key as never, params as never) : undefined;
}

export function FormError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="rounded-md border-l-4 border-danger bg-surface px-3 py-2 text-sm text-foreground"
    >
      {message}
    </p>
  );
}
