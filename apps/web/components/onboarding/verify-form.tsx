"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, Input } from "@sgela/ui";
import { resendCodeAction, verifyCodeAction, type FormState } from "@/app/(auth)/start/actions";
import { FormError, useErrorText } from "./field-error";

const RESEND_AFTER = 30;

/** 6-digit code; submits by itself on the 6th digit (saves a tap, PRD 7.1 acceptance). */
export function VerifyForm() {
  const t = useTranslations();
  const err = useErrorText();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(verifyCodeAction, {});
  const [resendState, resend, resending] = useActionState<FormState>(resendCodeAction, {});
  const [secondsLeft, setSecondsLeft] = useState(RESEND_AFTER);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  return (
    <div className="flex flex-col gap-5">
      <form ref={formRef} action={action} className="flex flex-col gap-5" noValidate>
        <Input
          name="code"
          label={t("start.codeLabel")}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          pattern="[0-9]{6}"
          className="text-center font-heading text-2xl tracking-[0.5em]"
          error={err(state.fieldErrors?.code, state.params)}
          onChange={(e) => {
            const digits = e.currentTarget.value.replace(/\D/g, "").slice(0, 6);
            e.currentTarget.value = digits;
            if (digits.length === 6 && !pending) formRef.current?.requestSubmit();
          }}
          autoFocus
        />
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? t("start.verifying") : t("common.continue")}
        </Button>
      </form>
      <form
        action={() => {
          setSecondsLeft(RESEND_AFTER);
          resend();
        }}
        className="flex flex-col items-start gap-2"
      >
        <FormError message={err(resendState.error, resendState.params)} />
        {secondsLeft > 0 ? (
          <p className="text-sm text-muted" aria-live="polite">
            {t("start.resendIn", { seconds: secondsLeft })}
          </p>
        ) : (
          <Button type="submit" variant="link" className="px-0" disabled={resending}>
            {t("start.resend")}
          </Button>
        )}
      </form>
      <Link href="/start" className="text-sm text-link underline">
        {t("start.changeNumber")}
      </Link>
    </div>
  );
}
