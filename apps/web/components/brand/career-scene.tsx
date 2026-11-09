"use client";

import { useEffect, useRef } from "react";
import { cn } from "@sgela/ui";

/**
 * "Career holodeck" brand scene (D-030). A lime perspective grid floor rushes toward the
 * viewer (a nod to Veza's VR worlds), a wireframe globe with a compass core spins above it,
 * and the five career worlds orbit on tilted 3D paths with light beams to the core.
 *
 * Performance: SVG only; one requestAnimationFrame loop moves ~25 attributes, paused when the
 * tab is hidden or the scene is off screen. Under prefers-reduced-motion the scene is drawn
 * once, still. Decorative: hidden from assistive tech.
 */

const W = 800;
const H = 1000;
const CX = 470;
const CY = 430;
const HORIZON = 640;
const FLOOR_LINES = 14;

interface Planet {
  code: string;
  colour: string;
  orbit: 0 | 1;
  phase: number;
  speed: number;
}

const ORBITS = [
  { a: 220, b: 70, tilt: (-12 * Math.PI) / 180 },
  { a: 288, b: 96, tilt: (9 * Math.PI) / 180 },
];

const PLANETS: Planet[] = [
  { code: "AVI", colour: "#4FA3FF", orbit: 0, phase: 0.3, speed: 0.22 },
  { code: "MED", colour: "#3FD1B5", orbit: 0, phase: 3.4, speed: 0.22 },
  { code: "ENG", colour: "#FFB547", orbit: 1, phase: 1.2, speed: 0.15 },
  { code: "CUL", colour: "#FF6B5A", orbit: 1, phase: 3.3, speed: 0.15 },
  { code: "AGR", colour: "#ABCF37", orbit: 1, phase: 5.3, speed: 0.15 },
];

// Fixed pseudo-random star field (same on server and client).
const STARS = Array.from({ length: 46 }, (_, i) => {
  const x = (i * 157.3) % W;
  const y = (i * 89.7 + (i % 7) * 31) % (HORIZON - 40);
  return { x, y, r: i % 5 === 0 ? 1.8 : 1.1, delay: (i % 9) * 0.45 };
});

function planetAt(p: Planet, t: number) {
  const o = ORBITS[p.orbit]!;
  const th = p.phase + t * p.speed;
  const ex = o.a * Math.cos(th);
  const ey = o.b * Math.sin(th);
  const x = CX + ex * Math.cos(o.tilt) - ey * Math.sin(o.tilt);
  const y = CY + ex * Math.sin(o.tilt) + ey * Math.cos(o.tilt);
  const depth = Math.sin(th); // +1 front, -1 behind the globe
  return { x, y, depth };
}

function floorY(z: number) {
  return HORIZON + 260 / z;
}

export function CareerScene({
  names,
  className,
  align = "xMidYMid",
}: {
  names: Record<string, string>;
  className?: string;
  align?: "xMidYMid" | "xMinYMid";
}) {
  const svg = useRef<SVGSVGElement>(null);
  const planets = useRef<(SVGGElement | null)[]>([]);
  const beams = useRef<(SVGLineElement | null)[]>([]);
  const lines = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let visible = true;
    let start = performance.now();
    let elapsed = 0;

    function draw(t: number) {
      PLANETS.forEach((p, i) => {
        const { x, y, depth } = planetAt(p, t);
        const s = 0.72 + 0.38 * ((depth + 1) / 2);
        const g = planets.current[i];
        if (g) {
          g.setAttribute(
            "transform",
            `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`,
          );
          g.setAttribute("opacity", (depth < 0 ? 0.35 + 0.3 * (1 + depth) : 1).toFixed(2));
        }
        const b = beams.current[i];
        if (b) {
          b.setAttribute("x2", x.toFixed(1));
          b.setAttribute("y2", y.toFixed(1));
          b.setAttribute("opacity", (depth > 0 ? 0.25 + 0.55 * depth : 0).toFixed(2));
        }
      });
      const phase = (t * 0.35) % 1;
      lines.current.forEach((ln, n) => {
        if (!ln) return;
        const z = n + 1 - phase;
        const y = floorY(Math.max(z, 0.35));
        ln.setAttribute("y1", y.toFixed(1));
        ln.setAttribute("y2", y.toFixed(1));
        ln.setAttribute("opacity", Math.min(0.55, 0.9 / z).toFixed(2));
      });
    }

    function frame(now: number) {
      elapsed = (now - start) / 1000;
      draw(elapsed);
      raf = requestAnimationFrame(frame);
    }

    function run() {
      cancelAnimationFrame(raf);
      if (reduce.matches || !visible || document.hidden) {
        draw(elapsed);
        return;
      }
      start = performance.now() - elapsed * 1000;
      raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      run();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", run);
    reduce.addEventListener("change", run);
    run();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", run);
      reduce.removeEventListener("change", run);
    };
  }, []);

  const initial = PLANETS.map((p) => planetAt(p, 0));

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio={align + " slice"}
      aria-hidden="true"
      focusable="false"
      className={cn("career-scene", className)}
    >
      <defs>
        <radialGradient id="cs-sky" cx="65%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#16212b" />
          <stop offset="55%" stopColor="#0d1319" />
          <stop offset="100%" stopColor="#0B0F14" />
        </radialGradient>
        <radialGradient id="cs-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ABCF37" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#ABCF37" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#ABCF37" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cs-globe" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#2a3a1a" />
          <stop offset="100%" stopColor="#0f1612" />
        </radialGradient>
        <linearGradient id="cs-horizon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ABCF37" stopOpacity="0" />
          <stop offset="100%" stopColor="#ABCF37" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="cs-floor-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B0F14" stopOpacity="1" />
          <stop offset="18%" stopColor="#0B0F14" stopOpacity="0" />
        </linearGradient>
        <clipPath id="cs-floor">
          <rect x="0" y={HORIZON} width={W} height={H - HORIZON} />
        </clipPath>
      </defs>

      <rect width={W} height={H} fill="url(#cs-sky)" />

      {/* stars */}
      <g fill="#ffffff">
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            className="cs-twinkle"
            style={{ animationDelay: s.delay + "s" }}
          />
        ))}
      </g>

      {/* horizon glow */}
      <rect x="0" y={HORIZON - 120} width={W} height="120" fill="url(#cs-horizon)" />
      <line x1="0" y1={HORIZON} x2={W} y2={HORIZON} stroke="#ABCF37" strokeOpacity="0.6" />

      {/* perspective floor */}
      <g clipPath="url(#cs-floor)" stroke="#ABCF37" strokeWidth="1.2">
        {Array.from({ length: 23 }, (_, i) => {
          const x = -1100 + i * 140;
          return (
            <line
              key={"v" + i}
              x1={CX}
              y1={HORIZON}
              x2={CX + (x - CX) * 2.4}
              y2={H}
              strokeOpacity="0.28"
            />
          );
        })}
        {Array.from({ length: FLOOR_LINES }, (_, n) => {
          const y = floorY(n + 1);
          return (
            <line
              key={"h" + n}
              ref={(el) => {
                lines.current[n] = el;
              }}
              x1="0"
              x2={W}
              y1={y}
              y2={y}
              opacity={Math.min(0.55, 0.9 / (n + 1))}
            />
          );
        })}
        <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill="url(#cs-floor-fade)" />
      </g>

      {/* orbit paths */}
      <g fill="none" stroke="#ffffff" strokeOpacity="0.16">
        {ORBITS.map((o, i) => (
          <ellipse
            key={i}
            cx={CX}
            cy={CY}
            rx={o.a}
            ry={o.b}
            transform={`rotate(${((o.tilt * 180) / Math.PI).toFixed(1)} ${CX} ${CY})`}
            strokeDasharray={i ? "2 7" : undefined}
          />
        ))}
      </g>

      {/* beams from the core to worlds in front */}
      <g strokeWidth="1.5" className="cs-beams">
        {PLANETS.map((p, i) => (
          <line
            key={p.code}
            ref={(el) => {
              beams.current[i] = el;
            }}
            x1={CX}
            y1={CY}
            x2={initial[i]!.x}
            y2={initial[i]!.y}
            stroke={p.colour}
            strokeDasharray="6 10"
            opacity={initial[i]!.depth > 0 ? 0.25 + 0.55 * initial[i]!.depth : 0}
          />
        ))}
      </g>

      {/* globe */}
      <circle cx={CX} cy={CY} r="190" fill="url(#cs-core)" className="cs-pulse" />
      <circle cx={CX} cy={CY} r="112" fill="url(#cs-globe)" stroke="#ABCF37" strokeOpacity="0.7" />
      <g fill="none" stroke="#ABCF37" strokeOpacity="0.45">
        <ellipse cx={CX} cy={CY} rx="112" ry="34" />
        <ellipse cx={CX} cy={CY - 52} rx="98" ry="22" strokeOpacity="0.3" />
        <ellipse cx={CX} cy={CY + 52} rx="98" ry="22" strokeOpacity="0.3" />
        {[0, 1, 2].map((k) => (
          <ellipse
            key={k}
            cx={CX}
            cy={CY}
            rx="112"
            ry="112"
            className="cs-meridian"
            style={{ animationDelay: `${-k * 2}s` }}
          />
        ))}
      </g>
      {/* compass core */}
      <path
        d={`M${CX} ${CY - 46} L${CX + 11} ${CY} L${CX} ${CY + 46} L${CX - 11} ${CY} Z`}
        fill="#ABCF37"
      />
      <path
        d={`M${CX} ${CY} L${CX + 11} ${CY} L${CX} ${CY + 46} Z`}
        fill="#0B0F14"
        fillOpacity="0.35"
      />
      <circle cx={CX} cy={CY} r="5" fill="#0B0F14" />

      {/* worlds */}
      {PLANETS.map((p, i) => (
        <g
          key={p.code}
          ref={(el) => {
            planets.current[i] = el;
          }}
          transform={`translate(${initial[i]!.x.toFixed(1)} ${initial[i]!.y.toFixed(1)})`}
        >
          <circle r="26" fill={p.colour} fillOpacity="0.16" />
          <circle r="13" fill={p.colour} />
          <circle r="13" fill="none" stroke="#ffffff" strokeOpacity="0.5" />
          <text
            y="42"
            textAnchor="middle"
            fill="#ffffff"
            fillOpacity="0.9"
            fontSize="15"
            fontWeight="600"
          >
            {names[p.code] ?? p.code}
          </text>
        </g>
      ))}
    </svg>
  );
}
