import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { IctCourse, type IctLabels } from "@/components/learn/ict-course";
import { requireLearnerPage } from "@/lib/auth/rbac";

export async function generateMetadata() {
  return { title: "Career-Ready: ICT Basics" };
}

/**
 * Interactive ICT Basics course (D-040), the first real Learn content. Built from SAQA Unit
 * Standard 14921. Reading + clickable questions with instant feedback; progress saved per device.
 */
export default async function IctBasicsPage() {
  await requireLearnerPage();
  const t = await getTranslations("demo");
  const ti = await getTranslations("demo.ict");
  const labels: IctLabels = {
    overview: ti("overview"),
    start: ti("start"),
    continue: ti("continue"),
    check: ti("check"),
    next: ti("next"),
    back: ti("back"),
    correct: ti("correct"),
    tryAgain: ti("tryAgain"),
    yes: ti("true"),
    no: ti("false"),
    yourAnswer: ti("yourAnswer"),
    finishTopic: ti("finishTopic"),
    done: ti("done"),
    doneBody: ti.raw("doneBody"),
    reset: ti("reset"),
    progress: ti("progress"),
    answered: ti.raw("answered"),
    minutes: ti.raw("minutes"),
    standard: ti("standard"),
    topicDone: ti("topicDone"),
    pickOne: ti("pickOne"),
  };

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/learn"
        className="flex items-center gap-1.5 self-start text-sm font-semibold text-link hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("learn.allCourses")}
      </Link>
      <IctCourse labels={labels} />
    </section>
  );
}
