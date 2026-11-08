/**
 * Brand motion art (D-022): slow compass rings and five career-world orbits on deep space.
 * Pure SVG + CSS transforms (cheap on low-end phones); decorative, hidden from assistive tech.
 * Motion stops under prefers-reduced-motion via the global rule in tokens.css.
 */
const WORLDS = [
  { colour: "#4FA3FF", r: 300, start: 20, dur: "70s" },
  { colour: "#FFB547", r: 240, start: 150, dur: "55s" },
  { colour: "#FF6B5A", r: 300, start: 250, dur: "70s" },
  { colour: "#3FD1B5", r: 180, start: 300, dur: "45s" },
  { colour: "#ABCF37", r: 240, start: 60, dur: "55s" },
];

export function OrbitArt({
  className,
  align = "xMidYMid",
}: {
  className?: string;
  align?: "xMidYMid" | "xMinYMid";
}) {
  return (
    <svg
      viewBox="0 0 800 800"
      preserveAspectRatio={align + " slice"}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <pattern id="orbit-dots" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#ffffff" fillOpacity="0.07" />
        </pattern>
        <radialGradient id="orbit-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ABCF37" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#ABCF37" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#ABCF37" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="orbit-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ABCF37" stopOpacity="0" />
          <stop offset="100%" stopColor="#ABCF37" stopOpacity="0.28" />
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="#0B0F14" />
      <rect width="800" height="800" fill="url(#orbit-dots)" />
      <circle cx="400" cy="400" r="380" fill="url(#orbit-glow)" />

      {/* radar sweep */}
      <g className="orbit-spin" style={{ animationDuration: "14s" }}>
        <path d="M400 400 L780 400 A380 380 0 0 0 668 131 Z" fill="url(#orbit-sweep)" />
      </g>

      {/* rings */}
      <g fill="none" stroke="#ABCF37">
        <circle cx="400" cy="400" r="120" strokeOpacity="0.45" />
        <g className="orbit-spin orbit-reverse" style={{ animationDuration: "120s" }}>
          <circle cx="400" cy="400" r="180" strokeOpacity="0.3" strokeDasharray="2 10" />
        </g>
        <g className="orbit-spin" style={{ animationDuration: "160s" }}>
          <circle cx="400" cy="400" r="240" strokeOpacity="0.22" strokeDasharray="40 14 4 14" />
        </g>
        <circle cx="400" cy="400" r="300" strokeOpacity="0.14" />
        <circle cx="400" cy="400" r="370" strokeOpacity="0.08" strokeDasharray="1 8" />
      </g>

      {/* compass ticks */}
      <g stroke="#ABCF37" strokeOpacity="0.5" strokeLinecap="round">
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i * Math.PI) / 12;
          const long = i % 6 === 0;
          const r1 = long ? 96 : 104;
          return (
            <line
              key={i}
              x1={400 + Math.cos(a) * r1}
              y1={400 + Math.sin(a) * r1}
              x2={400 + Math.cos(a) * 112}
              y2={400 + Math.sin(a) * 112}
              strokeWidth={long ? 3 : 1.5}
            />
          );
        })}
      </g>

      {/* world orbits */}
      {WORLDS.map((w) => (
        <g
          key={w.colour}
          className="orbit-spin"
          style={{ animationDuration: w.dur, rotate: w.start + "deg" }}
        >
          <circle cx={400 + w.r} cy="400" r="22" fill={w.colour} fillOpacity="0.18" />
          <circle cx={400 + w.r} cy="400" r="9" fill={w.colour} />
        </g>
      ))}

      {/* centre needle */}
      <g className="orbit-pulse">
        <circle cx="400" cy="400" r="54" fill="#ABCF37" fillOpacity="0.12" />
      </g>
      <path d="M400 340 L414 400 L400 460 L386 400 Z" fill="#ABCF37" />
      <path d="M400 400 L414 400 L400 460 Z" fill="#0B0F14" fillOpacity="0.35" />
      <circle cx="400" cy="400" r="6" fill="#0B0F14" />
    </svg>
  );
}
