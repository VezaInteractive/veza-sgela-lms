"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@sgela/ui";
import { requestCodeAction, type FormState } from "@/app/(auth)/start/actions";
import { FormError, useErrorText } from "./field-error";

export function PhoneForm() {
  const t = useTranslations();
  const err = useErrorText();
  const [state, action, pending] = useActionState<FormState, FormData>(requestCodeAction, {});
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Input
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        label={t("start.phoneLabel")}
        hint={t("start.phoneHint")}
        error={err(state.fieldErrors?.phone)}
        defaultValue={state.values?.phone}
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
