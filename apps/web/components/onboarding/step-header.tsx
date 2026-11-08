import { getTranslations } from "next-intl/server";

export async function StepHeader({
  title,
  intro,
  step,
  total,
}: {
  title: string;
  intro?: string;
  step?: number;
  total?: number;
}) {
  const t = await getTranslations("start");
  return (
    <div className="flex flex-col gap-2">
      {step && total ? (
        <p className="text-sm font-semibold text-muted">{t("stepOf", { step, total })}</p>
      ) : null}
      <h1 className="font-heading text-2xl font-bold md:text-3xl">{title}</h1>
      {intro ? <p className="text-muted">{intro}</p> : null}
    </div>
  );
}
