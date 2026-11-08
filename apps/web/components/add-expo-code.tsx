"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@sgela/ui";
import { addExpoCodeAction, type FormState } from "@/app/(auth)/start/actions";

/** L-ON-8: add a claim code later from Me. */
export function AddExpoCode() {
  const t = useTranslations("claim");
  const [state, action, pending] = useActionState<FormState, FormData>(addExpoCodeAction, {});
  return (
    <form action={action} className="flex flex-col gap-3" noValidate>
      <Input
        name="code"
        label={t("addLabel")}
        autoComplete="off"
        autoCapitalize="characters"
        maxLength={8}
        error={state.fieldErrors?.code ? t("invalidTitle") : undefined}
      />
      <Button type="submit" variant="secondary" disabled={pending}>
        {t("addButton")}
      </Button>
    </form>
  );
}
