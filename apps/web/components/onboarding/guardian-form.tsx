"use client";

import { useActionState, useId } from "react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@sgela/ui";
import { inviteGuardianAction, type FormState } from "@/app/(auth)/start/actions";
import { FormError, useErrorText } from "./field-error";

export function GuardianForm() {
  const t = useTranslations("guardian");
  const err = useErrorText();
  const relId = useId();
  const [state, action, pending] = useActionState<FormState, FormData>(inviteGuardianAction, {});
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Input
        name="guardianName"
        label={t("name")}
        autoComplete="off"
        error={err(state.fieldErrors?.guardianName)}
        required
      />
      <Input
        name="guardianPhone"
        type="tel"
        inputMode="tel"
        label={t("phone")}
        autoComplete="off"
        error={err(state.fieldErrors?.guardianPhone)}
        required
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor={relId} className="text-sm font-medium">
          {t("relationship")}
        </label>
        <select
          id={relId}
          name="relationship"
          defaultValue="MOTHER"
          className="h-11 rounded-md border border-border bg-surface px-3 text-base text-foreground"
        >
          <option value="MOTHER">{t("relMother")}</option>
          <option value="FATHER">{t("relFather")}</option>
          <option value="GUARDIAN">{t("relGuardian")}</option>
          <option value="OTHER">{t("relOther")}</option>
        </select>
      </div>
      <p className="text-sm text-muted">{t("sentNote")}</p>
      <FormError message={err(state.error, state.params)} />
      <Button type="submit" size="lg" disabled={pending}>
        {t("send")}
      </Button>
    </form>
  );
}
