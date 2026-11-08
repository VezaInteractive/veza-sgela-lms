import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getDb } from "@sgela/db";
import { ProfileForm } from "@/components/onboarding/profile-form";
import { requireSignedInPage } from "@/lib/auth/rbac";
import { onboardingPath } from "@/lib/onboarding/steps";

export async function generateMetadata() {
  return { title: (await getTranslations("profile"))("title") };
}

export default async function ProfilePage() {
  const session = await requireSignedInPage();
  if (session.user.learner) redirect(onboardingPath(session.user.learner) ?? "/home");
  const subjects = await getDb().subject.findMany({
    orderBy: { name: "asc" },
    select: { code: true },
  });
  return <ProfileForm subjects={subjects.map((s) => s.code)} />;
}
