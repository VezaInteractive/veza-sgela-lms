import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { CareerForm } from "@/components/admin/catalog-forms";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/auth/rbac";
import { listWorlds } from "@/lib/explore/catalog";

export const metadata = { title: "New career", robots: { index: false } };

export default async function NewCareerPage({ searchParams }: PageProps<"/admin/careers/new">) {
  const session = await requireAdminPage();
  const locale = await getLocale();
  const { error, world } = await searchParams;
  const worlds = await listWorlds(locale);
  const t = await getTranslations("admin.careers");
  const first = worlds[0]?.code ?? "AVI";
  const chosen = typeof world === "string" && worlds.some((w) => w.code === world) ? world : first;
  const adminName = session.user.learner
    ? [session.user.learner.firstName, session.user.learner.lastName].filter(Boolean).join(" ")
    : "Admin";

  return (
    <AdminShell
      tab="careers"
      adminName={adminName}
      title={t("addCareer")}
      actions={
        <Link
          href="/admin/careers"
          className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-semibold hover:border-primary"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t("back")}
        </Link>
      }
    >
      <div className="glass rounded-2xl p-5 md:p-6">
        <CareerForm
          worlds={worlds.map((w) => ({ code: w.code, name: w.name }))}
          error={typeof error === "string" ? error : undefined}
          career={{
            id: null,
            slug: "",
            industryCode: chosen,
            title: "",
            summary: "",
            salaryBandNote: "",
            dayInLife: [],
            studyRoutes: [],
            subjectsRequired: [],
            subjectsRecommended: [],
            sortOrder: 0,
            roleModel: null,
          }}
        />
      </div>
    </AdminShell>
  );
}
