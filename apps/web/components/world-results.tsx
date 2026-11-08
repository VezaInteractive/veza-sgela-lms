import { getTranslations } from "next-intl/server";
import { Badge } from "@sgela/ui";
import { WorldIcon, worldStyle } from "./demo/world-visuals";

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
            style={worldStyle(r.worldCode)}
            className="world-tint flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
            aria-label={t("claim.scoreLabel", { world, score: r.score })}
          >
            <span className="flex items-center gap-2">
              <WorldIcon code={r.worldCode} size="sm" />
              <Badge tone={tone} className="sr-only">
                {r.worldCode}
              </Badge>
              <span className="font-semibold">{world}</span>
              {r.simulated && simulatedLabel ? (
                <span className="text-xs text-muted">({simulatedLabel})</span>
              ) : null}
            </span>
            <span className="font-heading text-2xl font-bold tabular-nums" aria-hidden="true">
              {r.score}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
