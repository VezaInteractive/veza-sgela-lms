import { getTranslations } from "next-intl/server";
import { BookOpen, CheckCircle2, Clock, GraduationCap } from "lucide-react";
import { CourseCard, PageIntro, StatStrip } from "@/components/dashboard/parts";
import { SampleNote } from "@/components/demo/ui";
import { wantsLessData } from "@/lib/data-saver";
import { COURSES } from "@/lib/demo/data";
import { coursePhoto } from "@/lib/demo/photos";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("learn") };
}

/** Learn index (demo shell for M3; reference "MyCourses" layout, D-021). */
export default async function LearnPage() {
  const t = await getTranslations("demo");
  const lessData = await wantsLessData();
  const started = COURSES.filter((c) => c.progress > 0).length;
  const topicsDone = COURSES.flatMap((c) => c.topics).filter((tp) => tp.status === "done").length;
  const minutes = COURSES.flatMap((c) => c.topics)
    .filter((tp) => tp.status === "done")
    .reduce((sum, tp) => sum + tp.minutes, 0);
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageIntro title={t("learn.title")} intro={t("learn.intro")} />
      <StatStrip
        stats={[
          {
            label: t("learn.statEnrolled"),
            value: String(started),
            icon: BookOpen,
            accent: "#FF6B5A",
          },
          {
            label: t("learn.statTopicsDone"),
            value: String(topicsDone),
            icon: CheckCircle2,
            accent: "#9B7BFF",
          },
          { label: t("learn.statMinutes"), value: String(minutes), icon: Clock, accent: "#4FA3FF" },
          {
            label: t("learn.statAccredited"),
            value: String(COURSES.filter((c) => c.accredited).length),
            icon: GraduationCap,
            accent: "#3FD1B5",
          },
        ]}
      />
      <h2 className="sr-only">{t("learn.allCourses")}</h2>
      <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {COURSES.map((c) => (
          <li key={c.slug}>
            <CourseCard
              course={c}
              photo={lessData ? undefined : coursePhoto(c.slug)}
              labels={{
                minutes: t("learn.minutes", { n: c.minutes }),
                topics: t("learn.topicCount", { n: c.topics.length }),
                complete: t("learn.complete", { n: c.progress }),
                accredited: t("learn.accredited"),
                progressLabel: c.title + ": " + t("learn.complete", { n: c.progress }),
              }}
            />
          </li>
        ))}
      </ul>
      <SampleNote>{t("sample")}</SampleNote>
    </section>
  );
}
