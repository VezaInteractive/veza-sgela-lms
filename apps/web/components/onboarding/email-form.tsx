"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@sgela/ui";
import { requestCodeAction, type FormState } from "@/app/(auth)/start/actions";
import { FormError, useErrorText } from "./field-error";

/** Email sign-in / sign-up (D-039): one address, a 6-digit code is sent to it. */
export function EmailForm() {
  const t = useTranslations();
  const err = useErrorText();
  const [state, action, pending] = useActionState<FormState, FormData>(requestCodeAction, {});
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Input
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        label={t("start.emailLabel")}
        hint={t("start.emailHint")}
        error={err(state.fieldErrors?.email)}
        defaultValue={state.values?.email}
        required
      />
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="trustDevice"
          defaultChecked
          className="size-5 accent-primary"
        />
        {t("start.trustDevice")}
      </label>
      <FormError message={err(state.error, state.params)} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t("common.saving") : t("start.sendCode")}
      </Button>
    </form>
  );
}
