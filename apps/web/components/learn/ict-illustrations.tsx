/**
 * Inline, theme-aware illustrations for the ICT Basics sessions (D-040). Each session names an
 * `illus` id; this renders a small branded SVG scene for it. SVGs use `currentColor` + the
 * session accent (passed as `colour`) so they read in light and dark without extra assets, stay
 * crisp at any size, and cost nothing to download (CLAUDE.md: mobile-first, data-saver aware).
 */

export function Illus({ id, colour }: { id: string; colour: string }) {
  const Scene = SCENES[id] ?? Hardware;
  return (
    <div
      aria-hidden="true"
      className="relative flex aspect-[16/7] w-full items-center justify-center overflow-hidden rounded-2xl"
      style={{
        color: colour,
        background: `linear-gradient(135deg, ${colour}22, transparent 60%)`,
      }}
    >
      <svg
        viewBox="0 0 320 140"
        className="h-full w-full"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Scene />
      </svg>
    </div>
  );
}

const mono = "var(--color-muted, #8a93a2)";

/** Session 1 (14921): stand-alone + networked machines. */
function Hardware() {
  return (
    <>
      <rect x={28} y={46} width={60} height={42} rx={4} />
      <rect x={38} y={92} width={40} height={6} rx={3} fill="currentColor" stroke="none" />
      <circle cx={160} cy={67} r={14} />
      <rect x={118} y={52} width={30} height={30} rx={3} stroke={mono} />
      <rect x={172} y={52} width={30} height={30} rx={3} stroke={mono} />
      <path d="M160 53 v-14 M160 81 v14 M148 67 h-2 M174 67 h-2" stroke={mono} />
      <rect x={236} y={40} width={56} height={54} rx={4} stroke={mono} />
      <line x1={246} y1={54} x2={282} y2={54} stroke={mono} />
      <line x1={246} y1={66} x2={282} y2={66} stroke={mono} />
      <line x1={246} y1={78} x2={270} y2={78} stroke={mono} />
    </>
  );
}

/** Session 2 (14921): star network topology. */
function Topology() {
  const spokes: [number, number][] = [
    [160, 24],
    [232, 50],
    [232, 104],
    [160, 118],
    [88, 104],
    [88, 50],
  ];
  return (
    <>
      {spokes.map(([x, y], i) => (
        <line key={i} x1={160} y1={70} x2={x} y2={y} stroke={mono} />
      ))}
      {spokes.map(([x, y], i) => (
        <circle
          key={`n${i}`}
          cx={x}
          cy={y}
          r={11}
          fill="currentColor"
          stroke="none"
          opacity={0.85}
        />
      ))}
      <circle cx={160} cy={70} r={16} />
      <circle cx={160} cy={70} r={6} fill="currentColor" stroke="none" />
    </>
  );
}

/** Session 3 (14921): application windows / app grid. */
function Apps() {
  const cells: [number, number][] = [
    [60, 40],
    [136, 40],
    [212, 40],
    [60, 86],
    [136, 86],
    [212, 86],
  ];
  return (
    <>
      {cells.map(([x, y], i) => (
        <g key={i}>
          <rect
            x={x}
            y={y}
            width={48}
            height={34}
            rx={5}
            stroke={i === 1 ? "currentColor" : mono}
          />
          <circle cx={x + 10} cy={y + 10} r={3} fill="currentColor" stroke="none" />
          <line x1={x + 18} y1={y + 10} x2={x + 40} y2={y + 10} stroke={mono} />
          <line x1={x + 8} y1={y + 22} x2={x + 40} y2={y + 22} stroke={mono} />
        </g>
      ))}
    </>
  );
}

/** Session 4 (14921): dev / staging / prod pipeline. */
function Environments() {
  const stages = [40, 136, 232];
  return (
    <>
      {stages.map((x, i) => (
        <g key={i}>
          <rect
            x={x}
            y={48}
            width={48}
            height={44}
            rx={6}
            stroke={i === 2 ? "currentColor" : mono}
          />
          <circle cx={x + 24} cy={66} r={8} stroke={i === 2 ? "currentColor" : mono} />
          <line x1={x + 12} y1={82} x2={x + 36} y2={82} stroke={mono} />
        </g>
      ))}
      <path d="M120 70 l10 0 M126 64 l8 6 l-8 6" stroke="currentColor" />
      <path d="M216 70 l10 0 M222 64 l8 6 l-8 6" stroke="currentColor" />
    </>
  );
}

/** Session 1 (14963): the organisation / building. */
function Organisation() {
  return (
    <>
      <rect x={96} y={40} width={88} height={64} rx={4} />
      <path d="M96 40 l44 -20 l44 20" />
      {[112, 134, 156].map((x) => (
        <rect key={x} x={x} y={56} width={14} height={14} rx={2} stroke={mono} />
      ))}
      <rect x={130} y={80} width={20} height={24} rx={2} stroke={mono} />
      <circle cx={232} cy={70} r={16} stroke={mono} />
      <path d="M232 60 a6 6 0 0 1 0 12 a8 9 0 0 0 0 16" stroke={mono} />
      <path d="M216 98 q16 -16 32 0" stroke={mono} />
    </>
  );
}

/** Session 2 (14963): costing / money. */
function Costing() {
  return (
    <>
      <rect x={40} y={44} width={150} height={60} rx={6} stroke={mono} />
      {[58, 72, 86].map((y) => (
        <line key={y} x1={54} y1={y} x2={150} y2={y} stroke={mono} />
      ))}
      <line x1={160} y1={58} x2={176} y2={58} />
      <line x1={160} y1={72} x2={176} y2={72} />
      <line x1={160} y1={86} x2={176} y2={86} />
      <circle cx={246} cy={70} r={26} />
      <path d="M246 54 v32 M238 62 h12 a6 6 0 0 1 0 12 h-12 M238 74 h14" />
    </>
  );
}

/** Session 3 (14963): internet / connectivity. */
function Internet() {
  return (
    <>
      <circle cx={160} cy={74} r={30} />
      <ellipse cx={160} cy={74} rx={12} ry={30} stroke={mono} />
      <line x1={130} y1={74} x2={190} y2={74} stroke={mono} />
      <path d="M134 58 q26 -12 52 0 M134 90 q26 12 52 0" stroke={mono} />
      <path d="M96 38 a44 44 0 0 1 0 72" stroke="currentColor" />
      <path d="M84 30 a60 60 0 0 1 0 88" stroke={mono} />
      <path d="M224 38 a44 44 0 0 0 0 72" stroke="currentColor" />
      <path d="M236 30 a60 60 0 0 0 0 88" stroke={mono} />
    </>
  );
}

/** Session 4 (14963): portfolio of evidence / checklist. */
function Portfolio() {
  return (
    <>
      <rect x={104} y={30} width={112} height={84} rx={6} />
      <rect x={134} y={22} width={52} height={16} rx={4} stroke={mono} />
      {[48, 66, 84].map((y) => (
        <g key={y}>
          <rect x={118} y={y} width={12} height={12} rx={3} stroke="currentColor" />
          <path d={`M121 ${y + 6} l2 3 l5 -6`} stroke="currentColor" />
          <line x1={138} y1={y + 6} x2={200} y2={y + 6} stroke={mono} />
        </g>
      ))}
    </>
  );
}

const SCENES: Record<string, () => React.ReactElement> = {
  hardware: Hardware,
  topology: Topology,
  apps: Apps,
  environments: Environments,
  organisation: Organisation,
  costing: Costing,
  internet: Internet,
  portfolio: Portfolio,
};
