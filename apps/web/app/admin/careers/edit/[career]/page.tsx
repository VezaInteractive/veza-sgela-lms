import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@sgela/db";
import { CareerForm } from "@/components/admin/catalog-forms";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/auth/rbac";
import { listWorlds } from "@/lib/explore/catalog";
import { roleModelOf, routesOf, stringList } from "@/lib/explore/content";

export const metadata = { title: "Edit career", robots: { index: false } };

export default async function EditCareerPage({
  params,
  searchParams,
}: PageProps<"/admin/careers/edit/[career]">) {
  const session = await requireAdminPage();
  const { career } = await params;
  const { error } = await searchParams;
  const locale = await getLocale();
  const [row, worlds] = await Promise.all([
    getDb().career.findUnique({ where: { slug: career } }),
    listWorlds(locale),
  ]);
  if (!row) notFound();
  const t = await getTranslations("admin.careers");
  const adminName = session.user.learner
    ? [session.user.learner.firstName, session.user.learner.lastName].filter(Boolean).join(" ")
    : "Admin";

  return (
    <AdminShell
      tab="careers"
      adminName={adminName}
      title={row.title}
      intro={t("edit")}
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
            id: row.id,
            slug: row.slug,
            industryCode: row.industryCode,
            title: row.title,
            summary: row.summary,
            salaryBandNote: row.salaryBandNote ?? "",
            dayInLife: stringList(row.dayInLife),
            studyRoutes: routesOf(row.studyRoutes),
            subjectsRequired: row.subjectsRequired,
            subjectsRecommended: row.subjectsRecommended,
            sortOrder: row.sortOrder,
            roleModel: roleModelOf(row.roleModel),
          }}
        />
      </div>
    </AdminShell>
  );
}
