import { ChefHat, Plane, Sprout, Stethoscope, Zap, type LucideIcon } from "lucide-react";
import { cn } from "@sgela/ui";

export const WORLD_COLOURS: Record<string, string> = {
  AVI: "#4FA3FF",
  ENG: "#FFB547",
  CUL: "#FF6B5A",
  MED: "#3FD1B5",
  AGR: "#ABCF37",
};

const ICONS: Record<string, LucideIcon> = {
  AVI: Plane,
  ENG: Zap,
  CUL: ChefHat,
  MED: Stethoscope,
  AGR: Sprout,
};

/** Inline style that feeds the `.world-tint` / `.world-icon` / `.lift` classes. */
export function worldStyle(code: string): React.CSSProperties {
  return { ["--w" as string]: WORLD_COLOURS[code] ?? "#ABCF37" };
}

export function WorldIcon({
  code,
  size = "md",
  className,
}: {
  code: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const Icon = ICONS[code] ?? Sprout;
  const box = {
    sm: "size-8 rounded-lg",
    md: "size-11 rounded-xl",
    lg: "size-14 rounded-2xl",
    xl: "size-20 rounded-3xl",
  }[size];
  const icon = { sm: "size-4", md: "size-5", lg: "size-7", xl: "size-10" }[size];
  return (
    <span
      aria-hidden="true"
      style={worldStyle(code)}
      className={cn("world-icon inline-flex shrink-0 items-center justify-center", box, className)}
    >
      <Icon className={icon} strokeWidth={2} />
    </span>
  );
}

/**
 * 2D Career Compass (PRD 7.2 SVG fallback): five spokes, one per world. A node sits further
 * out and grows with the learner score; unplayed worlds stay small at the inner ring.
 * Text labels carry identity, so colour is never the only cue (dataviz rules).
 */
export function CareerCompass({
  worlds,
  initial,
  label,
}: {
  worlds: { code: string; name: string; score: number | null }[];
  initial: string;
  label: string;
}) {
  const size = 320;
  const c = size / 2;
  const rMax = 118;
  const rings = [0.35, 0.6, 0.85, 1];
  const points = worlds.map((w, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / worlds.length;
    const s = w.score ?? 0;
    const r = rMax * (0.3 + 0.7 * (s / 100));
    return {
      ...w,
      x: c + Math.cos(angle) * r,
      y: c + Math.sin(angle) * r,
      lx: c + Math.cos(angle) * (rMax + 26),
      ly: c + Math.sin(angle) * (rMax + 26),
      ex: c + Math.cos(angle) * rMax,
      ey: c + Math.sin(angle) * rMax,
      nodeR: w.score === null ? 5 : 7 + (s / 100) * 9,
    };
  });
  const polygon = points.map((p) => p.x + "," + p.y).join(" ");

  return (
    <svg
      viewBox={`-56 -16 ${size + 112} ${size + 32}`}
      role="img"
      aria-label={label}
      className="h-auto w-full max-w-[400px] overflow-visible"
    >
      <defs>
        <radialGradient id="compass-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ABCF37" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ABCF37" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={rMax} fill="url(#compass-core)" />
      {rings.map((k) => (
        <circle
          key={k}
          cx={c}
          cy={c}
          r={rMax * k}
          fill="none"
          stroke="var(--border)"
          strokeDasharray={k === 1 ? undefined : "2 5"}
        />
      ))}
      {points.map((p) => (
        <line key={"s" + p.code} x1={c} y1={c} x2={p.ex} y2={p.ey} stroke="var(--border)" />
      ))}
      <polygon
        points={polygon}
        fill="color-mix(in oklab, #ABCF37 18%, transparent)"
        stroke="#ABCF37"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {points.map((p) => (
        <g key={p.code}>
          <circle
            cx={p.x}
            cy={p.y}
            r={p.nodeR}
            fill={WORLD_COLOURS[p.code]}
            stroke="var(--background)"
            strokeWidth={2}
            opacity={p.score === null ? 0.45 : 1}
          />
          <text
            x={p.lx}
            y={p.ly}
            textAnchor={Math.abs(p.lx - c) < 8 ? "middle" : p.lx > c ? "start" : "end"}
            dominantBaseline="middle"
            className="fill-foreground text-[12px] font-semibold"
          >
            {p.name}
          </text>
          <text
            x={p.lx}
            y={p.ly + 15}
            textAnchor={Math.abs(p.lx - c) < 8 ? "middle" : p.lx > c ? "start" : "end"}
            dominantBaseline="middle"
            className="fill-muted text-[11px]"
          >
            {p.score === null ? "–" : p.score}
          </text>
        </g>
      ))}
      <circle cx={c} cy={c} r={20} fill="#ABCF37" />
      <text
        x={c}
        y={c + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-[16px] font-bold"
        fill="#0B0F14"
      >
        {initial}
      </text>
    </svg>
  );
}
