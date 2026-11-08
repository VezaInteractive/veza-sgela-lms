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
        <div className="flex flex-col gap-2">
          <div aria-hidden="true" className="flex gap-1.5">
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                className={
                  "h-1.5 flex-1 rounded-full " +
                  (i < step ? "bg-primary shadow-[0_0_12px_-2px_var(--primary)]" : "bg-border")
                }
              />
            ))}
          </div>
          <p className="text-sm font-semibold text-muted">{t("stepOf", { step, total })}</p>
        </div>
      ) : null}
      <h1 className="font-heading text-3xl leading-tight font-bold md:text-4xl">
        <span className="text-gradient">{title}</span>
      </h1>
      {intro ? <p className="text-muted">{intro}</p> : null}
    </div>
  );
}
