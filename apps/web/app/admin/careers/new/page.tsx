import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { CareerForm } from "@/components/admin/catalog-forms";
import { PageIntro } from "@/components/dashboard/parts";
import { SimpleShellWide } from "@/components/simple-shell";
import { requireAdminPage } from "@/lib/auth/rbac";
import { listWorlds } from "@/lib/explore/catalog";

export const metadata = { title: "New career", robots: { index: false } };

export default async function NewCareerPage({ searchParams }: PageProps<"/admin/careers/new">) {
  await requireAdminPage();
  const locale = await getLocale();
  const { error, world } = await searchParams;
  const worlds = await listWorlds(locale);
  const t = await getTranslations("admin.careers");
  const first = worlds[0]?.code ?? "AVI";
  const chosen = typeof world === "string" && worlds.some((w) => w.code === world) ? world : first;

  return (
    <SimpleShellWide>
      <Link
        href="/admin/careers"
        className="flex items-center gap-1.5 self-start text-sm font-semibold text-link hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("back")}
      </Link>
      <PageIntro title={t("addCareer")} />
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
    </SimpleShellWide>
  );
}
