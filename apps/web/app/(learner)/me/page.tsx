import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Award,
  BookOpen,
  Box,
  ChevronRight,
  Flame,
  Gamepad2,
  Lock,
  LogOut,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { getDb } from "@sgela/db";
import { getDistrict, PROVINCES } from "@sgela/geo";
import { Button } from "@sgela/ui";
import { signOutAction, signOutEverywhereAction } from "@/app/(auth)/start/actions";
import { AddExpoCode } from "@/components/add-expo-code";
import { PageIntro, Panel } from "@/components/dashboard/parts";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { SampleNote } from "@/components/demo/ui";
import { PhotoForm } from "@/components/profile/photo-form";
import { WorldResults } from "@/components/world-results";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { linkedResults } from "@/lib/claim/service";
import { BADGES, CREDENTIALS, LEARNER_STATS } from "@/lib/demo/data";
import { isMinor } from "@/lib/onboarding/steps";
import { avatarUrlFor } from "@/lib/profile/avatar";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("me") };
}

const BADGE_ICONS: Record<string, { icon: LucideIcon; accent: string }> = {
  "expo-explorer": { icon: Gamepad2, accent: "#4FA3FF" },
  "first-topic": { icon: BookOpen, accent: "#ABCF37" },
  "streak-7": { icon: Flame, accent: "#FF6B5A" },
  "3d-tinkerer": { icon: Box, accent: "#9B7BFF" },
};

/**
 * Me (D-025): portrait profile card + photo controls + account on the left; expo results,
 * badges, credentials and "add an expo code" on the right. Badges and credentials are sample
 * content until M4 (D-018).
 */
export default async function MePage() {
  const { learner } = await requireLearnerPage();
  const t = await getTranslations();
  const td = await getTranslations("demo");
  const [results, school] = await Promise.all([
    linkedResults(learner.id),
    learner.schoolId
      ? getDb().school.findUnique({ where: { id: learner.schoolId }, select: { name: true } })
      : null,
  ]);
  const waiting = learner.restricted && isMinor(learner.dateOfBirth) && learner.guardian;
  const s = LEARNER_STATS;
  const name = [learner.firstName, learner.lastName].filter(Boolean).join(" ");
  const district = getDistrict(learner.districtCode)?.name;
  const province = PROVINCES.find((p) => p.code === learner.provinceCode)?.name;
  const gradeLabel =
    learner.inSchool && learner.grade
      ? td("home.gradeValue", { grade: learner.grade })
      : learner.inSchool
        ? undefined
        : td("home.notInSchool");
  const photoUrl = avatarUrlFor(learner);

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageIntro title={td("me.title")} intro={td("me.intro")} />

      {waiting ? (
        <div
          data-testid="restricted-banner"
          className="flex flex-col gap-2 rounded-2xl border-2 border-warning bg-surface p-5"
        >
          <h2 className="font-heading text-lg font-semibold">{t("me.restrictedTitle")}</h2>
          <p className="text-sm">{t("me.restrictedBody", { guardian: learner.guardian!.name })}</p>
          <Link href="/start/guardian" className="text-sm font-semibold text-link underline">
            {t("me.resendGuardian")}
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <ProfileCard
            name={name}
            photoUrl={photoUrl}
            subtitle={
              [gradeLabel, school?.name ?? learner.schoolNameFree].filter(Boolean).join(" · ") ||
              undefined
            }
            place={[district, province].filter(Boolean).join(", ") || undefined}
            level={td("home.levelValue", { level: s.level })}
            xpLabel={td("home.xpToNext", { xp: s.xp, next: s.nextLevelXp, level: s.level + 1 })}
            xpPct={Math.round((s.xp / s.nextLevelXp) * 100)}
            editLabel={t("me.photo.title")}
            editHref="#photo"
          />

          <div id="photo" className="scroll-mt-24">
            <Panel title={t("me.photo.title")}>
              <p className="flex gap-2 text-sm text-muted">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {t("me.photo.body")}
              </p>
              <PhotoForm hasPhoto={Boolean(photoUrl)} />
            </Panel>
          </div>

          <Panel title={t("me.account")}>
            <Link
              href="/me/privacy"
              className="flex items-center justify-between rounded-xl border border-border p-3 text-sm font-semibold hover:border-primary"
            >
              {t("me.privacy")}
              <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
            <div className="flex flex-wrap gap-2">
              <form action={signOutAction}>
                <Button type="submit" variant="secondary" size="sm">
                  <LogOut aria-hidden="true" className="size-4" />
                  {t("common.signOut")}
                </Button>
              </form>
              <form action={signOutEverywhereAction}>
                <Button type="submit" variant="ghost" size="sm">
                  {t("common.signOutEverywhere")}
                </Button>
              </form>
            </div>
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel title={t("me.resultsTitle")}>
            {results.length > 0 ? (
              <WorldResults results={results} simulatedLabel={t("me.simulated")} />
            ) : (
              <p className="text-sm text-muted">{t("me.resultsEmpty")}</p>
            )}
          </Panel>

          <Panel title={td("me.badgesTitle")}>
            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {BADGES.map((b) => {
                const { icon: Icon, accent } = BADGE_ICONS[b.code] ?? {
                  icon: Award,
                  accent: "#ABCF37",
                };
                return (
                  <li
                    key={b.code}
                    style={{ ["--w" as string]: accent }}
                    className={
                      "flex flex-col items-center gap-2 rounded-2xl p-4 text-center " +
                      (b.earned ? "stat-tile" : "border border-dashed border-border")
                    }
                  >
                    <span
                      aria-hidden="true"
                      className={
                        "flex size-12 items-center justify-center rounded-xl " +
                        (b.earned ? "stat-chip" : "bg-surface-raised text-muted")
                      }
                    >
                      {b.earned ? <Icon className="size-6" /> : <Lock className="size-5" />}
                    </span>
                    <span className="text-sm font-semibold">{b.name}</span>
                    <span className="text-xs text-muted">
                      {b.earned ? td("me.earned") : b.description}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel title={td("me.credentials")}>
              <ul className="flex flex-col gap-3">
                {CREDENTIALS.map((c) => (
                  <li key={c.title} className="flex gap-3 rounded-xl border border-border p-3">
                    <span
                      aria-hidden="true"
                      style={{ ["--w" as string]: "#ABCF37" }}
                      className="stat-chip flex size-10 shrink-0 items-center justify-center rounded-lg"
                    >
                      <Award className="size-5" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm font-semibold">{c.title}</span>
                      <span className="text-xs text-muted">
                        {c.issuer} · {c.issued} · {c.kind}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel id="add-results" title={t("claim.addTitle")}>
              <p className="text-sm text-muted">{t("claim.addIntro")}</p>
              <AddExpoCode />
            </Panel>
          </div>
          <SampleNote>{td("sample")}</SampleNote>
        </div>
      </div>
    </section>
  );
}
