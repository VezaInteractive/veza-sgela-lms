import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@sgela/db";
import { IndustryForm } from "@/components/admin/catalog-forms";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/auth/rbac";

export const metadata = { title: "Edit world", robots: { index: false } };

export default async function EditWorldPage({
  params,
  searchParams,
}: PageProps<"/admin/careers/world/[code]">) {
  const session = await requireAdminPage();
  const { code } = await params;
  const { error } = await searchParams;
  const db = getDb();
  const [industry, sponsors, assets] = await Promise.all([
    db.industry.findUnique({ where: { code: code.toUpperCase() } }),
    db.organisation.findMany({
      where: { type: { in: ["SPONSOR", "ACCREDITATION_PARTNER", "CONTENT_PARTNER"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.asset3D.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!industry) notFound();
  const t = await getTranslations("admin.careers");
  const adminName = session.user.learner
    ? [session.user.learner.firstName, session.user.learner.lastName].filter(Boolean).join(" ")
    : "Admin";

  return (
    <AdminShell
      tab="careers"
      adminName={adminName}
      title={industry.name}
      intro={t("editWorld")}
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
        <IndustryForm
          industry={{
            code: industry.code,
            name: industry.name,
            tagline: industry.tagline,
            color: industry.color,
            sortOrder: industry.sortOrder,
            vrSummary: industry.vrSummary ?? "",
            whyItMatters: Array.isArray(industry.whyItMatters)
              ? (industry.whyItMatters as string[])
              : [],
            sponsorOrgId: industry.sponsorOrgId,
            heroAssetId: industry.heroAssetId,
          }}
          sponsors={sponsors}
          assets={assets}
          error={typeof error === "string" ? error : undefined}
        />
      </div>
    </AdminShell>
  );
}
