import { getTranslations } from "next-intl/server";
import { Badge } from "@sgela/ui";

const TONES = ["AVI", "ENG", "CUL", "MED", "AGR"] as const;
type Tone = (typeof TONES)[number];

/** World badges with scores. Meaning is in text, not colour alone (PRD 14.1). */
export async function WorldResults({
  results,
  simulatedLabel,
}: {
  results: { worldCode: string; score: number; simulated?: boolean }[];
  simulatedLabel?: string;
}) {
  const t = await getTranslations();
  return (
    <ul className="flex flex-col gap-2" data-testid="world-results">
      {results.map((r, i) => {
        const world = t(("worlds." + r.worldCode) as never);
        const tone = (TONES as readonly string[]).includes(r.worldCode)
          ? (r.worldCode as Tone)
          : "neutral";
        return (
          <li
            key={r.worldCode + i}
            className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3"
            aria-label={t("claim.scoreLabel", { world, score: r.score })}
          >
            <span className="flex items-center gap-2">
              <Badge tone={tone}>{r.worldCode}</Badge>
              <span className="font-semibold">{world}</span>
              {r.simulated && simulatedLabel ? (
                <span className="text-xs text-muted">({simulatedLabel})</span>
              ) : null}
            </span>
            <span className="font-heading text-xl font-bold" aria-hidden="true">
              {r.score}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
