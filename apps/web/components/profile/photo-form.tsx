"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Trash2 } from "lucide-react";
import { Button } from "@sgela/ui";
import { photoAction, type PhotoState } from "@/app/(learner)/me/actions";
import { FormError } from "@/components/onboarding/field-error";

/** Choose, preview, save or remove the learner's own profile photo (D-025). */
export function PhotoForm({ hasPhoto }: { hasPhoto: boolean }) {
  const t = useTranslations("me.photo");
  const [state, act, pending] = useActionState<PhotoState, FormData>(photoAction, {});
  const [preview, setPreview] = useState<string | null>(null);
  const ok = state.ok === "saved" ? t("saved") : state.ok === "removed" ? t("removed") : null;

  return (
    <div className="flex flex-col gap-3">
      <form action={act} className="flex flex-col gap-3">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border p-3 focus-within:border-primary hover:border-primary">
          <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-raised">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <img src={preview} alt="" className="size-full object-cover" />
            ) : (
              <Camera aria-hidden="true" className="size-6 text-muted" />
            )}
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold">{t("choose")}</span>
            <span className="text-xs text-muted">{t("hint")}</span>
          </span>
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            data-testid="photo-input"
            onChange={(e) => {
              const f = e.currentTarget.files?.[0];
              setPreview((old) => {
                if (old) URL.revokeObjectURL(old);
                return f ? URL.createObjectURL(f) : null;
              });
            }}
          />
        </label>
        <Button type="submit" disabled={pending || !preview}>
          {t("upload")}
        </Button>
      </form>
      {hasPhoto ? (
        <form action={act}>
          <input type="hidden" name="intent" value="remove" />
          <Button type="submit" variant="ghost" size="sm" disabled={pending}>
            <Trash2 aria-hidden="true" className="size-4" />
            {t("remove")}
          </Button>
        </form>
      ) : null}
      {state.error ? (
        <FormError message={t(("errors." + state.error) as "errors.NO_FILE")} />
      ) : null}
      <p role="status" className="text-sm text-muted">
        {ok}
      </p>
    </div>
  );
}
