import { AppShell } from "@/components/app-shell";
import { requireLearnerPage } from "@/lib/auth/rbac";

/** Learner area: signed-in learners who finished onboarding (restricted learners included). */
export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  await requireLearnerPage();
  return <AppShell>{children}</AppShell>;
}
