import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button, Card } from "@sgela/ui";
import { formatClaimCode } from "@sgela/contracts";
import { startClaimAction } from "@/app/(auth)/start/actions";
import { SubmitButton } from "@/components/onboarding/submit-button";
import { WorldResults } from "@/components/world-results";
import { trackEvent } from "@/lib/analytics/server";
import { getCurrentSession } from "@/lib/auth/session";
import { previewClaim } from "@/lib/claim/service";

export async function generateMetadata() {
  return { title: (await getTranslations("claim"))("save") };
}

function Problem({
  title,
  body,
  cta,
  href,
}: {
  title: string;
  body?: string;
  cta: string;
  href: string;
}) {
  return (
    <>
      <h1 className="font-heading text-2xl font-bold md:text-3xl">{title}</h1>
      {body ? <p className="text-muted">{body}</p> : null}
      <Button asChild size="lg">
        <Link href={href}>{cta}</Link>
      </Button>
    </>
  );
}

/** L-ON-1: QR landing. Shows worlds and scores, then Save my results. */
export default async function ClaimPage({ params }: PageProps<"/claim/[code]">) {
  const { code } = await params;
  const t = await getTranslations("claim");
  const session = await getCurrentSession();
  const result = await previewClaim(code, session?.user.learner?.id ?? null);
  await trackEvent({
    name: "claim_viewed",
    userId: session?.user.id,
    props: { status: result.ok ? (result.preview.claimed ? "claimed" : "open") : result.code },
  });

  if (!result.ok) {
    const expired = result.code === "CLAIM_EXPIRED";
    return (
      <Problem
        title={t(expired ? "expiredTitle" : "invalidTitle")}
        body={t(expired ? "expiredBody" : "invalidBody")}
        cta={t("signUpAnyway")}
        href="/start"
      />
    );
  }
  const { preview } = result;
  if (preview.claimedByViewer) {
    return <Problem title={t("mineTitle")} cta={t("openCompass")} href="/home" />;
  }
  if (preview.claimed) {
    return (
      <Problem title={t("usedTitle")} body={t("usedBody")} cta={t("signUpAnyway")} href="/start" />
    );
  }

  const tw = await getTranslations("worlds");
  const first = preview.worlds[0];
  const hero =
    preview.worlds.length === 1 && first
      ? t("heroOne", { world: tw(first.worldCode as never) })
      : t("heroMany", { count: preview.worlds.length });

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-muted">
          {t("codeLabel", { code: formatClaimCode(preview.code) })}
        </p>
        <h1 className="font-heading text-2xl font-bold md:text-3xl">{hero}</h1>
        <p className="text-muted">{t("subtitle")}</p>
      </div>
      <Card>
        <WorldResults results={preview.worlds} />
      </Card>
      <form action={startClaimAction}>
        <input type="hidden" name="code" value={preview.code} />
        <SubmitButton className="w-full">{t("save")}</SubmitButton>
      </form>
    </>
  );
}
