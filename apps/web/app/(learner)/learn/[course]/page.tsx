import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge, Button, Card } from "@sgela/ui";
import { ProgressBar, SampleNote } from "@/components/demo/ui";
import { getCourse } from "@/lib/demo/data";

export async function generateMetadata({ params }: PageProps<"/learn/[course]">) {
  const { course } = await params;
  return { title: getCourse(course)?.title ?? "" };
}

/** Course page with topic list (demo shell for M3). */
export default async function CoursePage({ params }: PageProps<"/learn/[course]">) {
  const { course: slug } = await params;
  const c = getCourse(slug);
  if (!c) notFound();
  const t = await getTranslations("demo");
  const status = { done: t("learn.done"), current: t("learn.current"), locked: t("learn.locked") };

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link href="/learn" className="text-sm text-link underline">
        {t("learn.back")}
      </Link>
      <div className="flex flex-col gap-2">
        <span className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-muted">{c.code}</span>
          {c.world ? <Badge tone={c.world}>{c.world}</Badge> : null}
          {c.accredited ? <Badge tone="lime">{t("learn.accredited")}</Badge> : null}
        </span>
        <h1 className="font-heading text-3xl font-bold">{c.title}</h1>
        <p className="text-muted">{c.summary}</p>
        <ProgressBar value={c.progress} label={t("learn.progress", { n: c.progress })} />
        <span className="text-sm text-muted">{t("learn.progress", { n: c.progress })}</span>
      </div>
      <Card className="flex flex-col gap-1 p-0">
        <h2 className="px-5 pt-5 font-heading text-lg font-semibold">{t("learn.topics")}</h2>
        <ol className="flex flex-col">
          {c.topics.map((tp, i) => (
            <li
              key={tp.title}
              className="flex items-center gap-4 border-t border-border px-5 py-4 first:border-t-0"
            >
              <span
                className={
                  "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold " +
                  (tp.status === "done"
                    ? "bg-primary text-primary-foreground"
                    : tp.status === "current"
                      ? "border-2 border-primary"
                      : "border border-border text-muted")
                }
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span className="flex flex-1 flex-col">
                <span className={tp.status === "locked" ? "text-muted" : "font-semibold"}>
                  {tp.title}
                </span>
                <span className="text-xs text-muted">
                  {t("learn.minutes", { n: tp.minutes })}
                  {tp.has3d ? " · " + t("learn.has3d") : ""}
                </span>
              </span>
              <span className="text-xs font-semibold text-muted">{status[tp.status]}</span>
            </li>
          ))}
        </ol>
      </Card>
      <div className="flex flex-col gap-2">
        <Button size="lg" disabled aria-describedby="lessons-soon">
          {t("learn.continue")}
        </Button>
        <p id="lessons-soon" className="text-sm text-muted">
          {t("learn.lessonsSoon")}
        </p>
      </div>
      <SampleNote>{t("sample")}</SampleNote>
    </section>
  );
}
