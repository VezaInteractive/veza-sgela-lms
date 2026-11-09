import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  BadgeInfo,
  CheckCircle2,
  GraduationCap,
  ListChecks,
  MessageCircleQuestion,
  Quote,
  Route,
  Wallet,
} from "lucide-react";
import { getDb } from "@sgela/db";
import { HeroStats, Panel } from "@/components/dashboard/parts";
import { WORLD_COLOURS, WorldIcon, worldStyle } from "@/components/demo/world-visuals";
import { InterestToggle } from "@/components/explore/interest-toggle";
import { ExploreModelViewer } from "@/components/explore/three-widgets";
import { trackEvent } from "@/lib/analytics/server";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { getCareer } from "@/lib/explore/catalog";
import { checkSubjects, gradeNineNudge, subjectSummary } from "@/lib/explore/subjects";
import { loadToggles, recordView } from "@/lib/interest/service";

type Params = PageProps<"/explore/[industry]/careers/[career]">;

export async function generateMetadata({ params }: Params) {
  const { industry, career } = await params;
  const c = await getCareer(industry, career, "en");
  return { title: c ? c.title : "" };
}

/**
 * Career page (L-EX-3, L-EX-5; M2-4). DB-backed career with day-in-the-life, study routes,
 * salary and role model. "Subjects you need" is highlighted against the learner's real
 * subjects (Maths Literacy does not count as Mathematics); Grade 9 learners get a subject
 * nudge. "I'm interested" and opening the page emit interest signals.
 */
export default async function CareerPage({ params }: Params) {
  const { industry, career } = await params;
  const { learner, user } = await requireLearnerPage();
  const locale = await getLocale();
  const c = await getCareer(industry, career, locale);
  if (!c) notFound();
  const t = await getTranslations("demo");
  const te = await getTranslations("explore");
  const tw = await getTranslations("worlds");
  const ts = await getTranslations("subjects");

  const [subjects, toggles] = await Promise.all([
    getDb().learnerSubject.findMany({
      where: { learnerId: learner.id },
      select: { subjectCode: true },
    }),
    loadToggles(learner.id),
  ]);
  after(async () => {
    await recordView(learner.id, {
      industryCode: c.world.code,
      careerId: c.id,
      sponsorOrgId: c.world.sponsor?.id ?? null,
    });
    await trackEvent({
      name: "career_viewed",
      userId: user.id,
      props: { world: c.world.code, career: c.slug },
    });
  });

  const mine = subjects.map((s) => s.subjectCode);
  const checks = checkSubjects(c.subjectsRequired, c.subjectsRecommended, mine);
  const sum = subjectSummary(checks);
  const nudge = gradeNineNudge(learner.grade, learner.inSchool, c.subjectsRequired);
  const colour = WORLD_COLOURS[c.world.code] ?? c.world.color;
  const worldName = tw(c.world.code as never);

  const badge = {
    have: "rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground",
    missing: "rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs text-muted",
    swap: "rounded-full bg-warning/25 px-2.5 py-0.5 text-xs font-semibold",
  } as const;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6" style={worldStyle(c.world.code)}>
      <Link
        href={"/explore/" + c.world.code.toLowerCase()}
        className="flex items-center gap-1.5 self-start text-sm font-semibold text-link hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {te("backToWorld", { world: worldName })}
      </Link>

      <div className="course-card flex flex-col gap-4 rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <WorldIcon code={c.world.code} size="lg" className="course-card-icon" />
            <div className="flex min-w-0 flex-col gap-1">
              <Link
                href={"/explore/" + c.world.code.toLowerCase()}
                className="text-sm font-semibold text-link hover:underline"
              >
                {worldName}
              </Link>
              <h1 className="font-heading text-3xl leading-tight font-bold md:text-4xl">
                {c.title}
              </h1>
            </div>
          </div>
          <InterestToggle
            industry={c.world.code}
            career={c.slug}
            on={toggles.has(c.id)}
            label={te("interested")}
            stateLabel={te("interestedOn")}
          />
        </div>
        <p className="max-w-2xl text-muted md:text-lg">{c.summary}</p>
      </div>

      <div className="glass rounded-2xl p-5 md:p-6">
        <HeroStats
          stats={[
            {
              label: te("required"),
              value: `${sum.requiredHave}/${sum.requiredTotal}`,
              icon: GraduationCap,
              accent: colour,
            },
            {
              label: te("routesTitle"),
              value: String(c.studyRoutes.length),
              icon: Route,
              accent: "#4FA3FF",
            },
            {
              label: te("dayInLife"),
              value: String(c.dayInLife.length),
              icon: ListChecks,
              accent: "#9B7BFF",
            },
          ]}
        />
      </div>

      {nudge ? (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <BadgeInfo aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-foreground" />
          <p>
            {te("grade9", {
              career: c.title,
              subjects: nudge.subjects.map((s) => ts(s as never)).join(", "),
            })}
            {nudge.mathsNotLiteracy ? " " + te("grade9Maths") : ""}
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title={te("dayInLife")} accent={colour}>
            <ol className="flex flex-col gap-3">
              {c.dayInLife.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className="flex size-6 shrink-0 items-center justify-center rounded-full bg-(--glass) text-xs font-bold"
                    style={{ color: colour }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title={te("routesTitle")} accent="#4FA3FF">
            <ul className="flex flex-col gap-2.5">
              {c.studyRoutes.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <Route aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-link" />
                  <span>
                    <span className="font-semibold">{te("routeTypes." + r.type)}</span>
                    {" · "}
                    {r.label}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          {c.roleModel ? (
            <Panel title={te("roleModelTitle")} accent="#FF6B5A">
              <figure className="flex flex-col gap-2">
                <Quote aria-hidden="true" className="size-5 text-muted" />
                <blockquote className="text-sm">{c.roleModel.story}</blockquote>
                <figcaption className="text-sm font-semibold text-muted">
                  {te("roleModelFrom", { name: c.roleModel.name, place: c.roleModel.place })}
                </figcaption>
              </figure>
            </Panel>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel title={te("subjectsTitle")} accent="#9B7BFF">
            <p className="text-sm text-muted">
              {sum.requiredTotal === 0
                ? te("subjectsNone")
                : sum.missingRequired.length === 0
                  ? te("subjectsAllSet")
                  : te("subjectsGap", { n: sum.missingRequired.length })}
            </p>
            <ul className="flex flex-col gap-2">
              {checks.map((check) => (
                <li
                  key={check.code}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="font-medium">{ts(check.code as never)}</span>
                    <span className="text-xs text-muted">
                      {check.required ? te("required") : te("recommended")}
                    </span>
                  </span>
                  <span className={badge[check.status]}>{te(check.status)}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/me"
              className="flex items-center gap-1.5 text-sm font-semibold text-link hover:underline"
            >
              <GraduationCap aria-hidden="true" className="size-4" />
              {te("subjectsEdit")}
            </Link>
          </Panel>

          <Panel title={te("salaryTitle")} accent="#FFB547">
            <p className="flex items-start gap-2.5 text-sm">
              <Wallet aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-link" />
              {c.salaryBandNote || "-"}
            </p>
          </Panel>

          {c.heroAsset ? (
            <Panel title={te("model3dTitle")} accent={colour}>
              <ExploreModelViewer
                glbUrl={c.heroAsset.glbUrl}
                posterUrl={c.heroAsset.posterUrl}
                sizeBytes={c.heroAsset.glbSizeBytes}
                alt={te("poster3d", { name: c.heroAsset.name })}
                accent={colour}
                labels={{
                  load: te("view3d"),
                  loading: te("loading3d"),
                  reset: te("reset3d"),
                  noWebgl: te("noWebgl"),
                  failed: te("failed3d"),
                  canvas: te("canvas3d", { name: c.heroAsset.name }),
                }}
              />
            </Panel>
          ) : null}
        </div>
      </div>

      <div className="glass flex flex-col items-start gap-3 rounded-2xl p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-center gap-3">
          <MessageCircleQuestion aria-hidden="true" className="size-6 shrink-0 text-link" />
          <div className="flex flex-col">
            <span className="font-semibold">{te("askCoach")}</span>
            <span className="text-sm text-muted">{te("coachSoon")}</span>
          </div>
        </div>
        <Link
          href="/help"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          <CheckCircle2 aria-hidden="true" className="size-4" />
          {te("askCoach")}
        </Link>
      </div>
    </section>
  );
}
