"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/(auth)/start/actions";
import { FormError, useErrorText } from "./field-error";

/** Wraps a server action form so server-rendered fields can show a localised error. */
export function ActionForm({
  action,
  children,
  className,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  children: React.ReactNode;
  className?: string;
}) {
  const err = useErrorText();
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const firstField = state.fieldErrors ? Object.values(state.fieldErrors)[0] : undefined;
  return (
    <form action={formAction} className={className ?? "flex flex-col gap-5"}>
      {children}
      <FormError message={err(state.error ?? firstField, state.params)} />
    </form>
  );
}
