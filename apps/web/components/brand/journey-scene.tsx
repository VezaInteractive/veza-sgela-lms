"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@sgela/ui";

/**
 * "Career journey" brand story (D-031): a 2.5D isometric diorama that loops the real product
 * journey, one career world per loop.
 *   Act 1  Expo     a sprite learner walks to the kiosk and puts on a VR headset
 *   Act 2  Inside   a portal opens and the world comes alive (plane, gears, pot, heartbeat, crops)
 *   Act 3  Score    the score card pops with XP sparks
 *   Act 4  Match    compass appears, path tiles light, the learner walks to an opportunity gate
 *
 * Motion: CSS keyframes restarted per act + pointer parallax (desktop). Under
 * prefers-reduced-motion the acts still change (crossfade only, no movement). A pause button
 * satisfies WCAG 2.2.2; the loop also stops while the tab is hidden or the panel is off screen.
 * The drawing is decorative and hidden from assistive tech (the tagline carries the message).
 */

const ACT_MS = 4200;
const WORLDS = [
  { code: "AVI", colour: "#4FA3FF", score: 78 },
  { code: "ENG", colour: "#FFB547", score: 71 },
  { code: "CUL", colour: "#FF6B5A", score: 64 },
  { code: "MED", colour: "#3FD1B5", score: 66 },
  { code: "AGR", colour: "#ABCF37", score: 83 },
] as const;

// Isometric island: tile coords u, v in [-1, 1] -> screen.
const IX = 500;
const IY = 500;
const HW = 300;
const HH = 170;
function iso(u: number, v: number, z = 0): [number, number] {
  return [IX + ((u - v) * HW) / 2, IY + ((u + v) * HH) / 2 - z];
}
const pt = (p: [number, number]) => p[0].toFixed(1) + "," + p[1].toFixed(1);
const poly = (ps: [number, number][]) => ps.map(pt).join(" ");

function isoBox(u: number, v: number, du: number, dv: number, h: number) {
  const a = iso(u - du, v - dv, h);
  const b = iso(u + du, v - dv, h);
  const c = iso(u + du, v + dv, h);
  const d = iso(u - du, v + dv, h);
  return {
    top: poly([a, b, c, d]),
    right: poly([b, c, iso(u + du, v + dv), iso(u + du, v - dv)]),
    left: poly([d, c, iso(u + du, v + dv), iso(u - du, v + dv)]),
  };
}

const KIOSK = { u: -0.62, v: -0.55 };
const STAND = iso(-0.42, -0.2);
const START = iso(-0.9, 0.35);
const GATE = { u: 0.78, v: 0.3 };
const GATE_FRONT = iso(0.55, 0.42);
const PROP = iso(0.5, -0.55);
const PATH_TILES: [number, number][] = [
  [-0.25, -0.05],
  [0.0, 0.12],
  [0.25, 0.28],
  [0.5, 0.4],
];

const STARS = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 157.3) % 800,
  y: (i * 71.9 + (i % 5) * 37) % 430,
  r: i % 6 === 0 ? 1.8 : 1.1,
  d: (i % 8) * 0.5,
}));

const subscribeMotion = (cb: () => void) => {
  const m = window.matchMedia("(prefers-reduced-motion: reduce)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const PAUSE_KEY = "sgela.story.paused";
const pauseListeners = new Set<() => void>();
function readPaused() {
  try {
    return localStorage.getItem(PAUSE_KEY) === "1";
  } catch {
    return false;
  }
}
function writePaused(v: boolean) {
  try {
    localStorage.setItem(PAUSE_KEY, v ? "1" : "0");
  } catch {
    // storage blocked: nothing to remember
  }
  pauseListeners.forEach((l) => l());
}
function subscribePaused(l: () => void) {
  pauseListeners.add(l);
  return () => pauseListeners.delete(l);
}

/** Sprite learner: feet at (0,0). Walk cycle swings legs/arms; visor shows with the headset. */
function Learner({ walking, headset }: { walking: boolean; headset: boolean }) {
  return (
    <g className={walking ? "js-walking" : undefined}>
      <ellipse cx="0" cy="2" rx="16" ry="6" fill="#000" opacity="0.35" />
      <g className="js-bob">
        <rect className="js-leg-a" x="-8" y="-26" width="7" height="26" rx="3" fill="#231F20" />
        <rect className="js-leg-b" x="1" y="-26" width="7" height="26" rx="3" fill="#2d2829" />
        <rect className="js-arm-b" x="9" y="-50" width="6" height="22" rx="3" fill="#8dae27" />
        <rect x="-12" y="-54" width="24" height="32" rx="8" fill="#ABCF37" />
        <rect className="js-arm-a" x="-15" y="-50" width="6" height="22" rx="3" fill="#9cbf2f" />
        <circle cx="0" cy="-66" r="11" fill="#7a4a2a" />
        <path d="M-11 -68 Q0 -84 11 -68 Q6 -74 0 -74 Q-6 -74 -11 -68Z" fill="#1d1414" />
        <g className={cn("js-visor", headset && "js-visor-on")}>
          <rect x="-12" y="-71" width="24" height="9" rx="4" fill="#0B0F14" />
          <rect x="-9" y="-69" width="18" height="4" rx="2" fill="#ABCF37" opacity="0.9" />
        </g>
      </g>
    </g>
  );
}

function WorldProp({ code, colour }: { code: string; colour: string }) {
  const [x, y] = PROP;
  switch (code) {
    case "AVI":
      return (
        <g>
          <path
            d={`M${x - 150} ${y + 20} Q${x} ${y - 40} ${x + 170} ${y - 190}`}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.35"
            strokeWidth="3"
            strokeDasharray="4 10"
            className="js-contrail"
          />
          <g
            className="js-fly"
            style={{ ["--fx" as string]: `${x - 150}px`, ["--fy" as string]: `${y + 20}px` }}
          >
            <g transform="rotate(-32) scale(1.7)">
              <path d="M-34 0 L30 -5 Q40 0 30 5 Z" fill="#f5f7fa" />
              <path d="M-4 -2 L-18 -26 L-8 -26 L12 -2Z" fill={colour} />
              <path d="M-4 2 L-18 26 L-8 26 L12 2Z" fill={colour} />
              <path d="M-30 -1 L-38 -14 L-32 -14 L-24 -1Z" fill={colour} />
            </g>
          </g>
        </g>
      );
    case "ENG":
      return (
        <g transform={`translate(${x} ${y - 70})`}>
          <g className="js-spin">
            <circle r="38" fill="none" stroke={colour} strokeWidth="14" strokeDasharray="10 8" />
            <circle r="24" fill="#1a1f12" stroke={colour} strokeWidth="5" />
          </g>
          <g transform="translate(52 34)">
            <g className="js-spin-rev">
              <circle
                r="24"
                fill="none"
                stroke="#f5f7fa"
                strokeOpacity="0.8"
                strokeWidth="10"
                strokeDasharray="7 6"
              />
              <circle r="14" fill="#1a1f12" stroke="#f5f7fa" strokeOpacity="0.8" strokeWidth="4" />
            </g>
          </g>
          <path
            d="M-60 -60 L-74 -30 L-62 -30 L-72 0 L-46 -38 L-58 -38 L-48 -60Z"
            fill={colour}
            className="js-flash"
          />
        </g>
      );
    case "CUL":
      return (
        <g transform={`translate(${x} ${y - 10})`}>
          <ellipse
            cx="0"
            cy="12"
            rx="56"
            ry="12"
            fill={colour}
            opacity="0.35"
            className="js-flash"
          />
          <ellipse cx="0" cy="0" rx="46" ry="16" fill="#3a3436" />
          <rect x="-46" y="-44" width="92" height="44" fill="#4a4446" />
          <ellipse cx="0" cy="-44" rx="46" ry="16" fill="#2a2526" stroke={colour} strokeWidth="3" />
          <rect x="-62" y="-36" width="16" height="6" rx="3" fill="#4a4446" />
          <rect x="46" y="-36" width="16" height="6" rx="3" fill="#4a4446" />
          {[-18, 0, 18].map((dx, i) => (
            <path
              key={dx}
              d={`M${dx} -56 q-10 -18 0 -36 q10 -18 0 -36`}
              fill="none"
              stroke="#f5f7fa"
              strokeOpacity="0.7"
              strokeWidth="5"
              strokeLinecap="round"
              className="js-steam"
              style={{ animationDelay: i * 0.5 + "s" }}
            />
          ))}
        </g>
      );
    case "MED":
      return (
        <g transform={`translate(${x} ${y - 80})`}>
          <rect
            x="-90"
            y="-46"
            width="180"
            height="92"
            rx="14"
            fill="#0e1a19"
            stroke={colour}
            strokeWidth="2"
          />
          <path
            d="M-80 0 L-40 0 L-30 -26 L-16 30 L-4 -36 L8 0 L80 0"
            fill="none"
            stroke={colour}
            strokeWidth="4"
            strokeLinejoin="round"
            className="js-ecg"
          />
          <g transform="translate(0 -78)">
            <g className="js-beat">
              <rect x="-9" y="-24" width="18" height="48" rx="4" fill="#f5f7fa" />
              <rect x="-24" y="-9" width="48" height="18" rx="4" fill="#f5f7fa" />
            </g>
          </g>
        </g>
      );
    default:
      return (
        <g>
          {(
            [
              [-0.05, -0.55],
              [0.25, -0.45],
              [0.5, -0.3],
              [0.15, -0.2],
              [0.42, -0.08],
            ] as [number, number][]
          ).map(([u, v], i) => {
            const [sx, sy] = iso(u, v);
            return (
              <g key={i} transform={`translate(${sx} ${sy})`}>
                <g className="js-grow" style={{ animationDelay: i * 0.25 + "s" }}>
                  <rect x="-2" y="-40" width="4" height="40" fill="#5d8a2a" />
                  <path d="M0 -26 Q-22 -34 -24 -50 Q-6 -46 0 -30Z" fill={colour} />
                  <path d="M0 -34 Q22 -44 24 -60 Q6 -56 0 -38Z" fill="#c8e070" />
                </g>
              </g>
            );
          })}
        </g>
      );
  }
}

export function JourneyScene({
  names,
  captions,
  pauseLabel,
  playLabel,
  compact = false,
  className,
}: {
  names: Record<string, string>;
  /** [expo, inside({world}), score, match], already translated; "{world}" is replaced here. */
  captions: [string, string, string, string];
  pauseLabel: string;
  playLabel: string;
  compact?: boolean;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);
  const paused = useSyncExternalStore(subscribePaused, readPaused, () => false);
  const [visible, setVisible] = useState(true);
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e?.isIntersecting ?? true));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !visible) return;
    let id = 0;
    const start = () => {
      window.clearInterval(id);
      if (!document.hidden) id = window.setInterval(() => setTick((n) => n + 1), ACT_MS);
    };
    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", start);
    };
  }, [paused, visible]);

  // Pointer parallax (2.5D depth): background, island and foreground drift at different rates.
  useEffect(() => {
    const el = root.current;
    if (!el || reduced || compact) return;
    function onMove(e: PointerEvent) {
      const r = el!.getBoundingClientRect();
      el!.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      el!.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, compact]);

  const act = tick % 4;
  const world = WORLDS[Math.floor(tick / 4) % WORLDS.length]!;
  const name = names[world.code] ?? world.code;
  const key = String(tick);
  const kiosk = isoBox(KIOSK.u, KIOSK.v, 0.12, 0.09, 120);
  const gateL = isoBox(GATE.u - 0.16, GATE.v + 0.16, 0.045, 0.045, 175);
  const gateR = isoBox(GATE.u + 0.16, GATE.v - 0.16, 0.045, 0.045, 175);
  const gateTopA = iso(GATE.u - 0.16, GATE.v + 0.16, 182);
  const gateTopB = iso(GATE.u + 0.16, GATE.v - 0.16, 182);
  const kioskScreen = poly([
    iso(KIOSK.u + 0.12, KIOSK.v - 0.07, 110),
    iso(KIOSK.u + 0.12, KIOSK.v + 0.07, 110),
    iso(KIOSK.u + 0.12, KIOSK.v + 0.07, 52),
    iso(KIOSK.u + 0.12, KIOSK.v - 0.07, 52),
  ]);

  const walking = act === 0 || act === 3;
  const from = act === 3 ? STAND : START;
  const to = act === 3 ? GATE_FRONT : STAND;
  const caption = captions[act]!.replace("{world}", name);

  return (
    <div
      ref={root}
      className={cn("js-root absolute inset-0 overflow-hidden", className)}
      style={{ ["--w" as string]: world.colour }}
    >
      <svg
        viewBox="0 0 800 1000"
        preserveAspectRatio="xMidYMid slice"
        className="size-full"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id="js-sky" cx="60%" cy="45%" r="80%">
            <stop offset="0%" stopColor="#17222c" />
            <stop offset="60%" stopColor="#0d1319" />
            <stop offset="100%" stopColor="#0B0F14" />
          </radialGradient>
          <radialGradient id="js-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={world.colour} stopOpacity="0.4" />
            <stop offset="100%" stopColor={world.colour} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="js-beam" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ABCF37" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ABCF37" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* far layer */}
        <g className="js-layer-far">
          <rect x="-40" y="-40" width="880" height="1080" fill="url(#js-sky)" />
          <g fill="#fff">
            {STARS.map((s, i) => (
              <circle
                key={i}
                cx={s.x}
                cy={s.y}
                r={s.r}
                className="cs-twinkle"
                style={{ animationDelay: s.d + "s" }}
              />
            ))}
          </g>
          <circle cx={IX} cy={IY - 60} r="330" fill="url(#js-glow)" />
          {(
            [
              [150, 300, 0.35],
              [700, 250, 0.28],
              [690, 860, 0.3],
            ] as [number, number, number][]
          ).map(([x, y, s], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity="0.55">
              <g className="js-drift" style={{ animationDelay: -i * 2 + "s" }}>
                <polygon
                  points="0,-60 115,0 0,60 -115,0"
                  fill="#1a2a14"
                  stroke="#ABCF37"
                  strokeOpacity="0.4"
                  strokeWidth="3"
                />
                <polygon points="-115,0 0,60 0,110 -115,50" fill="#10180f" />
                <polygon points="0,60 115,0 115,50 0,110" fill="#0c120c" />
              </g>
            </g>
          ))}
        </g>

        {/* island layer */}
        <g className="js-layer-mid">
          <g className="js-float">
            <ellipse cx={IX} cy={IY + 250} rx="270" ry="46" fill="#000" opacity="0.35" />
            <polygon
              points={poly([iso(-1, 1), iso(1, 1), iso(1, 1, -70), iso(-1, 1, -70)])}
              fill="#121d10"
            />
            <polygon
              points={poly([iso(1, 1), iso(1, -1), iso(1, -1, -70), iso(1, 1, -70)])}
              fill="#0c140b"
            />
            <polygon
              points={poly([
                iso(-1, 1, -70),
                iso(1, 1, -70),
                iso(1, -1, -70),
                [IX + 50, IY + 290],
                [IX - 60, IY + 310],
              ])}
              fill="#0a0f09"
            />
            <polygon
              points={poly([iso(-1, -1), iso(1, -1), iso(1, 1), iso(-1, 1)])}
              fill="#1b2a16"
              stroke="#ABCF37"
              strokeOpacity="0.8"
              strokeWidth="2"
            />
            <g stroke="#ABCF37" strokeOpacity="0.16">
              {[-0.5, 0, 0.5].map((k) => (
                <g key={k}>
                  <line x1={iso(k, -1)[0]} y1={iso(k, -1)[1]} x2={iso(k, 1)[0]} y2={iso(k, 1)[1]} />
                  <line x1={iso(-1, k)[0]} y1={iso(-1, k)[1]} x2={iso(1, k)[0]} y2={iso(1, k)[1]} />
                </g>
              ))}
            </g>

            {/* expo kiosk */}
            <polygon points={kiosk.left} fill="#2a3138" />
            <polygon points={kiosk.right} fill="#1e242a" />
            <polygon points={kiosk.top} fill="#3a434c" />
            <polygon
              points={kioskScreen}
              fill={world.colour}
              opacity="0.85"
              className="js-screen"
            />

            {/* act scenes, remounted per act so their animations restart */}
            <g key={key} className="js-act">
              {act === 1 ? (
                <g>
                  <g className="js-portal">
                    <circle
                      cx={PROP[0]}
                      cy={PROP[1] - 90}
                      r="120"
                      fill={world.colour}
                      fillOpacity="0.12"
                      stroke={world.colour}
                      strokeWidth="6"
                    />
                  </g>
                  <WorldProp code={world.code} colour={world.colour} />
                </g>
              ) : null}
              {act === 2 ? (
                <g>
                  <g className="js-pop">
                    <rect
                      x={PROP[0] - 110}
                      y={PROP[1] - 170}
                      width="220"
                      height="100"
                      rx="20"
                      fill="#0B0F14"
                      fillOpacity="0.85"
                      stroke={world.colour}
                      strokeWidth="2"
                    />
                    <circle cx={PROP[0] - 70} cy={PROP[1] - 120} r="20" fill={world.colour} />
                    <text
                      x={PROP[0] - 38}
                      y={PROP[1] - 132}
                      fill="#ffffff"
                      fillOpacity="0.8"
                      fontSize="18"
                      fontWeight="600"
                    >
                      {name}
                    </text>
                    <text
                      x={PROP[0] - 38}
                      y={PROP[1] - 92}
                      fill="#ffffff"
                      fontSize="38"
                      fontWeight="800"
                    >
                      {world.score}
                    </text>
                  </g>
                  {Array.from({ length: 10 }, (_, i) => (
                    <rect
                      key={i}
                      x={PROP[0] - 120 + i * 26}
                      y={PROP[1] - 20}
                      width="7"
                      height="7"
                      fill={i % 2 ? "#ABCF37" : world.colour}
                      className="js-spark"
                      style={{ animationDelay: (i % 5) * 0.18 + "s" }}
                    />
                  ))}
                </g>
              ) : null}
              {act === 3 ? (
                <g>
                  {PATH_TILES.map(([u, v], i) => (
                    <polygon
                      key={i}
                      points={poly([
                        iso(u - 0.1, v - 0.1),
                        iso(u + 0.1, v - 0.1),
                        iso(u + 0.1, v + 0.1),
                        iso(u - 0.1, v + 0.1),
                      ])}
                      fill="#ABCF37"
                      className="js-tile"
                      style={{ animationDelay: i * 0.45 + "s" }}
                    />
                  ))}
                  <g className="js-rise">
                    <polygon points={gateL.left} fill="#2a3138" />
                    <polygon points={gateL.right} fill="#1e242a" />
                    <polygon points={gateL.top} fill="#ABCF37" />
                    <polygon points={gateR.left} fill="#2a3138" />
                    <polygon points={gateR.right} fill="#1e242a" />
                    <polygon points={gateR.top} fill="#ABCF37" />
                    <polygon
                      points={poly([
                        iso(GATE.u - 0.13, GATE.v + 0.13, 166),
                        iso(GATE.u + 0.13, GATE.v - 0.13, 166),
                        iso(GATE.u + 0.13, GATE.v - 0.13, 4),
                        iso(GATE.u - 0.13, GATE.v + 0.13, 4),
                      ])}
                      fill="url(#js-beam)"
                      className="js-gate-glow"
                    />
                    <line
                      x1={gateTopA[0]}
                      y1={gateTopA[1]}
                      x2={gateTopB[0]}
                      y2={gateTopB[1]}
                      stroke="#ABCF37"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <g
                      transform={`translate(${(gateTopA[0] + gateTopB[0]) / 2} ${(gateTopA[1] + gateTopB[1]) / 2 - 46})`}
                    >
                      <g className="js-bounce">
                        <circle r="26" fill="#0B0F14" stroke="#ABCF37" strokeWidth="3" />
                        <rect x="-13" y="-8" width="26" height="18" rx="3" fill="#ABCF37" />
                        <path d="M-6 -8 V-13 H6 V-8" fill="none" stroke="#ABCF37" strokeWidth="3" />
                      </g>
                    </g>
                  </g>
                  <g transform={`translate(${STAND[0]} ${STAND[1] - 175})`}>
                    <g className="js-pop">
                      <circle r="30" fill="#0B0F14" stroke="#ABCF37" strokeWidth="3" />
                      <g className="js-needle">
                        <path d="M0 -22 L7 0 L0 22 L-7 0Z" fill="#ABCF37" />
                      </g>
                    </g>
                  </g>
                </g>
              ) : null}
            </g>

            {/* learner sprite */}
            <g
              key={"l" + key}
              className={walking ? "js-walk" : undefined}
              style={
                walking
                  ? {
                      ["--x0" as string]: from[0] + "px",
                      ["--y0" as string]: from[1] + "px",
                      ["--x1" as string]: to[0] + "px",
                      ["--y1" as string]: to[1] + "px",
                    }
                  : undefined
              }
              transform={walking ? undefined : `translate(${STAND[0]} ${STAND[1]})`}
            >
              <g transform="scale(1.55)">
                <Learner walking={walking} headset={act === 1 || act === 2} />
              </g>
            </g>
          </g>
        </g>

        {/* near layer: floating motes */}
        <g className="js-layer-near">
          {(
            [
              [90, 720],
              [740, 520],
              [640, 960],
              [220, 930],
            ] as [number, number][]
          ).map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(45)`}>
              <rect
                x="-5"
                y="-5"
                width="10"
                height="10"
                fill="#ABCF37"
                opacity="0.5"
                className="js-drift"
                style={{ animationDelay: -i * 1.5 + "s" }}
              />
            </g>
          ))}
        </g>
      </svg>

      {!compact ? (
        <p
          key={"c" + key}
          aria-hidden="true"
          className="js-caption pointer-events-none absolute top-[13%] right-[7%] max-w-[15rem] rounded-2xl border border-white/15 bg-black/45 px-4 py-3 text-sm font-semibold text-white"
        >
          <span
            className="mb-1 block text-xs font-bold tracking-widest"
            style={{ color: world.colour }}
          >
            {act + 1} / 4
          </span>
          {caption}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => writePaused(!paused)}
        aria-label={paused ? playLabel : pauseLabel}
        aria-pressed={paused}
        data-testid="story-toggle"
        className={cn(
          "pointer-events-auto absolute z-20 flex items-center justify-center rounded-full border border-white/30 bg-black/55 text-white hover:bg-black/75",
          compact ? "right-2 bottom-2 size-8" : "right-5 bottom-5 size-10",
        )}
      >
        {paused ? (
          <Play aria-hidden="true" className="size-4" />
        ) : (
          <Pause aria-hidden="true" className="size-4" />
        )}
      </button>
      <span data-testid="story-act" data-act={act} data-world={world.code} hidden />
    </div>
  );
}
