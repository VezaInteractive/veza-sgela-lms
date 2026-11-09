import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ChartNoAxesColumn, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { getDb } from "@sgela/db";
import { Button } from "@sgela/ui";
import { signOutAction } from "@/app/(auth)/start/actions";
import { PageIntro } from "@/components/dashboard/parts";
import { WorldIcon, worldStyle } from "@/components/demo/world-visuals";
import { SimpleShellWide } from "@/components/simple-shell";
import { requireAdminPage } from "@/lib/auth/rbac";
import { listWorlds } from "@/lib/explore/catalog";
import { deleteCareerAction } from "./actions";

export const metadata = { title: "Worlds and careers", robots: { index: false } };

/**
 * Admin worlds and careers (A-2). Admin-only; lists every world and its careers with edit,
 * create and delete.
 */
export default async function AdminCareersPage({ searchParams }: PageProps<"/admin/careers">) {
  await requireAdminPage();
  const locale = await getLocale();
  const t = await getTranslations("admin.careers");
  const tc = await getTranslations("common");
  const { ok } = await searchParams;
  const [worlds, careers] = await Promise.all([
    listWorlds(locale),
    getDb().career.findMany({
      orderBy: [{ industryCode: "asc" }, { sortOrder: "asc" }],
      select: { id: true, slug: true, title: true, industryCode: true },
    }),
  ]);
  const byWorld = new Map<string, typeof careers>();
  for (const c of careers) {
    const list = byWorld.get(c.industryCode) ?? [];
    list.push(c);
    byWorld.set(c.industryCode, list);
  }

  return (
    <SimpleShellWide>
      <PageIntro title={t("title")} intro={t("intro")}>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/insights"
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold hover:border-primary"
          >
            <ChartNoAxesColumn aria-hidden="true" className="size-4" />
            {t("navInsights")}
          </Link>
          <form action={signOutAction}>
            <Button type="submit" variant="secondary" size="sm">
              <LogOut className="size-4" aria-hidden="true" />
              {tc("signOut")}
            </Button>
          </form>
        </div>
      </PageIntro>

      {ok ? (
        <p className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm font-medium">
          {ok === "deleted" ? t("deleted") : t("saved")}
        </p>
      ) : null}

      <div className="flex flex-col gap-5">
        {worlds.map((w) => {
          const list = byWorld.get(w.code) ?? [];
          return (
            <section
              key={w.code}
              style={worldStyle(w.code)}
              className="glass panel-accent flex flex-col gap-4 rounded-2xl p-5 md:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <WorldIcon code={w.code} size="md" />
                  <div className="flex flex-col">
                    <h2 className="font-heading text-lg font-semibold">{w.name}</h2>
                    <span className="text-xs text-muted">
                      {w.code} · {t("careersHeading", { n: list.length })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={"/admin/careers/world/" + w.code.toLowerCase()}
                    className="flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm font-semibold hover:border-primary"
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                    {t("editWorld")}
                  </Link>
                  <Link
                    href={"/admin/careers/new?world=" + w.code}
                    className="flex min-h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-sm font-semibold text-primary-foreground"
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    {t("addCareer")}
                  </Link>
                </div>
              </div>
              <ul className="flex flex-col divide-y divide-border">
                {list.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0 truncate text-sm font-medium">{c.title}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <Link
                        href={"/admin/careers/edit/" + c.slug}
                        className="flex items-center gap-1 text-sm font-semibold text-link hover:underline"
                      >
                        <Pencil aria-hidden="true" className="size-3.5" />
                        {t("edit")}
                      </Link>
                      <form action={deleteCareerAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="slug" value={c.slug} />
                        <input type="hidden" name="industryCode" value={c.industryCode} />
                        <button
                          type="submit"
                          className="flex items-center gap-1 text-sm font-semibold text-danger hover:underline"
                        >
                          <Trash2 aria-hidden="true" className="size-3.5" />
                          {t("delete")}
                        </button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </SimpleShellWide>
  );
}
