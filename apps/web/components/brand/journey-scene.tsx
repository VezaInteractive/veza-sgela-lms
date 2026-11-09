"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@sgela/ui";

/**
 * "Career journey" brand story (D-031): a 2.5D isometric diorama that loops the real product
 * journey, one career world per loop.
 *   Act 1  Expo     a sprite learner walks to the kiosk
 *   Act 2  Inside   headset on, a portal opens and the world's set comes alive
 *   Act 3  Score    the score card pops with XP sparks
 *   Act 4  Match    compass, lit path, a mentor waves at a rising opportunity gate
 *
 * Motion: CSS keyframes restarted per act + pointer parallax (desktop). Under
 * prefers-reduced-motion the acts still change (crossfade only, no movement). A pause button
 * satisfies WCAG 2.2.2; the loop also stops while the tab is hidden or the panel is off screen.
 * The drawing is decorative and hidden from assistive tech (the tagline carries the message).
 */

const ACT_MS = 3000;
const WORLDS = [
  { code: "AVI", colour: "#4FA3FF", score: 78 },
  { code: "ENG", colour: "#FFB547", score: 71 },
  { code: "CUL", colour: "#FF6B5A", score: 64 },
  { code: "MED", colour: "#3FD1B5", score: 66 },
  { code: "AGR", colour: "#ABCF37", score: 83 },
] as const;

// Isometric island: tile coords u, v in [-1, 1] -> screen.
const IX = 425;
const IY = 500;
const HW = 300;
const HH = 170;
function iso(u: number, v: number, z = 0): [number, number] {
  return [IX + ((u - v) * HW) / 2, IY + ((u + v) * HH) / 2 - z];
}
const pt = (p: [number, number]) => p[0].toFixed(1) + "," + p[1].toFixed(1);
const poly = (ps: [number, number][]) => ps.map(pt).join(" ");

function isoBox(u: number, v: number, du: number, dv: number, h: number, z = 0) {
  const a = iso(u - du, v - dv, z + h);
  const b = iso(u + du, v - dv, z + h);
  const c = iso(u + du, v + dv, z + h);
  const d = iso(u - du, v + dv, z + h);
  return {
    top: poly([a, b, c, d]),
    right: poly([b, c, iso(u + du, v + dv, z), iso(u + du, v - dv, z)]),
    left: poly([d, c, iso(u + du, v + dv, z), iso(u - du, v + dv, z)]),
  };
}

/** Shaded isometric block: lit top, mid right face, dark left face. */
function Block({
  u,
  v,
  du,
  dv,
  h,
  z = 0,
  top,
  side,
  dark,
  className,
}: {
  u: number;
  v: number;
  du: number;
  dv: number;
  h: number;
  z?: number;
  top: string;
  side: string;
  dark: string;
  className?: string;
}) {
  const b = isoBox(u, v, du, dv, h, z);
  return (
    <g className={className}>
      <polygon points={b.left} fill={dark} />
      <polygon points={b.right} fill={side} />
      <polygon points={b.top} fill={top} />
    </g>
  );
}

const KIOSK = { u: -0.62, v: -0.55 };
const STAND = iso(-0.42, -0.2);
const START = iso(-0.9, 0.35);
const GATE = { u: 0.78, v: 0.3 };
const GATE_FRONT = iso(0.55, 0.42);
const MENTOR = iso(0.98, 0.5);
const PROP = iso(0.5, -0.55);
const PATH_TILES: [number, number][] = [
  [-0.25, -0.05],
  [0.0, 0.12],
  [0.25, 0.28],
  [0.5, 0.4],
];

const STARS = Array.from({ length: 44 }, (_, i) => ({
  x: (i * 157.3) % 800,
  y: (i * 71.9 + (i % 5) * 37) % 420,
  r: i % 6 === 0 ? 2 : 1.2,
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

/**
 * Sprite learner, feet at (0,0): hooded lime hoodie with the Veza compass badge, jeans, white
 * sneakers, face and hair. Stepped walk cycle; the VR headset drops on in acts 2-3.
 */
function Learner({
  walking,
  headset,
  hoodie = "#ABCF37",
  shade = "#8dae27",
  skin = "#7a4a2a",
  idle = false,
}: {
  walking: boolean;
  headset: boolean;
  hoodie?: string;
  shade?: string;
  skin?: string;
  idle?: boolean;
}) {
  return (
    <g className={walking ? "js-walking" : idle ? "js-idle" : undefined}>
      <ellipse cx="0" cy="2" rx="17" ry="6" fill="#000" opacity="0.4" />
      <g className="js-bob">
        {/* legs + sneakers */}
        <g className="js-leg-a">
          <rect x="-8" y="-27" width="7" height="25" rx="3" fill="#2f4a7a" />
          <rect x="-10" y="-4" width="11" height="5" rx="2.5" fill="#f5f7fa" />
        </g>
        <g className="js-leg-b">
          <rect x="1" y="-27" width="7" height="25" rx="3" fill="#26406b" />
          <rect x="0" y="-4" width="11" height="5" rx="2.5" fill="#e3e8ef" />
        </g>
        {/* back arm */}
        <rect className="js-arm-b" x="9" y="-52" width="7" height="23" rx="3.5" fill={shade} />
        {/* hoodie */}
        <path d="M-13 -56 Q0 -61 13 -56 L14 -26 Q0 -22 -14 -26Z" fill={hoodie} />
        <path d="M-13 -56 Q0 -61 13 -56 L12 -50 Q0 -54 -12 -50Z" fill="#c8e070" />
        <rect x="-14" y="-30" width="28" height="5" rx="2.5" fill={shade} />
        <circle cx="-4" cy="-42" r="4.5" fill="#0B0F14" />
        <path d="M-4 -46 L-2.6 -42 L-4 -38 L-5.4 -42Z" fill="#ABCF37" />
        {/* front arm */}
        <rect className="js-arm-a" x="-16" y="-52" width="7" height="23" rx="3.5" fill={shade} />
        {/* head */}
        <rect x="-4" y="-61" width="8" height="5" fill="#6b3f22" />
        <circle cx="0" cy="-70" r="11" fill={skin} />
        <circle cx="-4" cy="-71" r="1.3" fill="#1d1414" />
        <circle cx="4" cy="-71" r="1.3" fill="#1d1414" />
        <path
          d="M-3.5 -66 Q0 -63.5 3.5 -66"
          fill="none"
          stroke="#1d1414"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M-11.5 -72 Q-12 -84 -2 -85 Q10 -86 11.5 -73 Q8 -79 0 -79 Q-8 -79 -11.5 -72Z"
          fill="#1d1414"
        />
        <circle cx="-9" cy="-82" r="4" fill="#1d1414" />
        <circle cx="8" cy="-83" r="4" fill="#1d1414" />
        {/* VR headset */}
        <g className={cn("js-visor", headset && "js-visor-on")}>
          <rect x="-13" y="-76" width="26" height="10" rx="4" fill="#0B0F14" />
          <rect x="-10" y="-74" width="20" height="5" rx="2.5" fill="#ABCF37" />
          <rect x="-13" y="-73" width="26" height="2" fill="#0B0F14" opacity="0.6" />
        </g>
      </g>
    </g>
  );
}

/** Mentor at the opportunity gate: navy blazer, glasses, tablet, waving. */
function Mentor() {
  return (
    <g>
      <ellipse cx="0" cy="2" rx="17" ry="6" fill="#000" opacity="0.4" />
      <rect x="-8" y="-27" width="7" height="25" rx="3" fill="#2a2526" />
      <rect x="1" y="-27" width="7" height="25" rx="3" fill="#231F20" />
      <rect x="-10" y="-4" width="11" height="5" rx="2.5" fill="#3a2a20" />
      <rect x="0" y="-4" width="11" height="5" rx="2.5" fill="#3a2a20" />
      <path d="M-14 -57 Q0 -61 14 -57 L14 -25 L-14 -25Z" fill="#1f3b63" />
      <path d="M-3 -57 L0 -44 L3 -57Z" fill="#f5f7fa" />
      <rect x="-16" y="-53" width="7" height="24" rx="3.5" fill="#1a3255" />
      <rect
        x="-22"
        y="-40"
        width="14"
        height="18"
        rx="2"
        fill="#0B0F14"
        stroke="#4FA3FF"
        strokeWidth="1.5"
      />
      <g className="js-wave">
        <rect x="9" y="-80" width="7" height="26" rx="3.5" fill="#1a3255" />
        <circle cx="12.5" cy="-82" r="4.5" fill="#5c3a22" />
      </g>
      <rect x="-4" y="-61" width="8" height="5" fill="#4a2c18" />
      <circle cx="0" cy="-70" r="11" fill="#5c3a22" />
      <path
        d="M-11 -71 Q-10 -83 0 -83 Q10 -83 11 -71 Q6 -77 0 -77 Q-6 -77 -11 -71Z"
        fill="#c9c9c9"
      />
      <circle cx="-4" cy="-70" r="3.2" fill="none" stroke="#f5f7fa" strokeWidth="1.3" />
      <circle cx="4" cy="-70" r="3.2" fill="none" stroke="#f5f7fa" strokeWidth="1.3" />
      <path
        d="M-3.5 -64.5 Q0 -62 3.5 -64.5"
        fill="none"
        stroke="#1d1414"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </g>
  );
}

type Role = "pilot" | "tech" | "chef" | "nurse" | "farmer";

/** A person doing the job, so each world reads at a glance. Feet at (0,0). */
function Worker({ role, colour }: { role: Role; colour: string }) {
  const outfit = {
    pilot: { shirt: "#f5f7fa", pants: "#1f2f4f", skin: "#5c3a22" },
    tech: { shirt: "#ff8a1f", pants: "#2f3b4a", skin: "#7a4a2a" },
    chef: { shirt: "#f5f7fa", pants: "#2a2526", skin: "#8a5a3a" },
    nurse: { shirt: "#2fb39a", pants: "#2fb39a", skin: "#5c3a22" },
    farmer: { shirt: "#c0392b", pants: "#2f5d9a", skin: "#7a4a2a" },
  }[role];
  return (
    <g>
      <ellipse cx="0" cy="2" rx="17" ry="6" fill="#000" opacity="0.4" />
      <g className="js-idle">
        <rect x="-8" y="-27" width="7" height="25" rx="3" fill={outfit.pants} />
        <rect x="1" y="-27" width="7" height="25" rx="3" fill={outfit.pants} />
        <rect x="-10" y="-4" width="11" height="5" rx="2.5" fill="#231F20" />
        <rect x="0" y="-4" width="11" height="5" rx="2.5" fill="#231F20" />
        <path d="M-14 -57 Q0 -61 14 -57 L14 -25 L-14 -25Z" fill={outfit.shirt} />
        {role === "pilot" ? (
          <>
            <path d="M-2 -57 L2 -57 L1 -38 L-1 -38Z" fill="#1f2f4f" />
            <rect x="-14" y="-57" width="7" height="3" fill="#e6b422" />
            <rect x="7" y="-57" width="7" height="3" fill="#e6b422" />
          </>
        ) : null}
        {role === "tech" ? (
          <>
            <rect x="-14" y="-44" width="28" height="3" fill="#e3e8ef" />
            <rect x="-14" y="-36" width="28" height="3" fill="#e3e8ef" />
          </>
        ) : null}
        {role === "chef" ? (
          <>
            <path d="M-5 -57 L0 -51 L5 -57Z" fill="#e74c3c" />
            {[-48, -40, -32].map((y) => (
              <circle key={y} cx="4" cy={y} r="1.6" fill="#9aa4b1" />
            ))}
          </>
        ) : null}
        {role === "nurse" ? (
          <path
            d="M-7 -57 Q-9 -44 -2 -42 Q4 -42 5 -48"
            fill="none"
            stroke="#231F20"
            strokeWidth="2"
          />
        ) : null}
        {role === "farmer" ? (
          <>
            <rect x="-11" y="-50" width="22" height="24" rx="3" fill={outfit.pants} />
            <rect x="-10" y="-58" width="3" height="10" fill={outfit.pants} />
            <rect x="7" y="-58" width="3" height="10" fill={outfit.pants} />
          </>
        ) : null}
        <g className={"js-work js-work-" + role}>
          <rect x="9" y="-53" width="7" height="24" rx="3.5" fill={outfit.shirt} />
          {role === "farmer" ? (
            <g>
              <path d="M10 -30 L30 -30 L28 -16 L12 -16Z" fill="#9aa4b1" />
              <path d="M30 -28 L42 -36" stroke="#9aa4b1" strokeWidth="3" />
              {[0, 1, 2].map((i) => (
                <circle
                  key={i}
                  cx={42 + i * 3}
                  cy={-32}
                  r="2"
                  fill="#4FA3FF"
                  className="js-drop"
                  style={{ animationDelay: i * 0.2 + "s" }}
                />
              ))}
            </g>
          ) : null}
          {role === "chef" ? (
            <rect
              x="12"
              y="-32"
              width="4"
              height="26"
              rx="2"
              fill="#b07a45"
              transform="rotate(25 14 -32)"
            />
          ) : null}
          {role === "nurse" ? (
            <rect
              x="12"
              y="-40"
              width="14"
              height="18"
              rx="2"
              fill="#f5f7fa"
              stroke={colour}
              strokeWidth="1.5"
            />
          ) : null}
        </g>
        <rect x="-16" y="-53" width="7" height="24" rx="3.5" fill={outfit.shirt} />
        <rect x="-4" y="-61" width="8" height="5" fill={outfit.skin} />
        <circle cx="0" cy="-70" r="11" fill={outfit.skin} />
        <circle cx="-4" cy="-70" r="1.3" fill="#1d1414" />
        <circle cx="4" cy="-70" r="1.3" fill="#1d1414" />
        <path
          d="M-3.5 -65 Q0 -62.5 3.5 -65"
          fill="none"
          stroke="#1d1414"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {role === "pilot" ? (
          <>
            <path d="M-12 -76 Q0 -90 12 -76Z" fill="#1f2f4f" />
            <rect x="-13" y="-78" width="26" height="5" rx="2" fill="#1f2f4f" />
            <rect x="-13" y="-76" width="26" height="2" fill="#e6b422" />
            <rect x="0" y="-75" width="17" height="3" rx="1.5" fill="#0f1a2e" />
          </>
        ) : null}
        {role === "tech" ? (
          <>
            <path d="M-13 -74 Q0 -94 13 -74Z" fill="#ffd21f" />
            <rect x="-15" y="-76" width="30" height="4" rx="2" fill="#f0c000" />
          </>
        ) : null}
        {role === "chef" ? (
          <>
            <rect x="-10" y="-96" width="20" height="18" fill="#f5f7fa" />
            <circle cx="-7" cy="-96" r="7" fill="#f5f7fa" />
            <circle cx="0" cy="-100" r="8" fill="#f5f7fa" />
            <circle cx="7" cy="-96" r="7" fill="#f5f7fa" />
            <rect x="-11" y="-80" width="22" height="4" fill="#e3e8ef" />
          </>
        ) : null}
        {role === "nurse" ? (
          <path
            d="M-12 -72 Q-12 -84 0 -84 Q12 -84 12 -72 Q6 -76 0 -76 Q-6 -76 -12 -72Z"
            fill="#2fb39a"
          />
        ) : null}
        {role === "farmer" ? (
          <>
            <ellipse cx="0" cy="-77" rx="22" ry="5" fill="#d9b25f" />
            <path d="M-10 -78 Q0 -92 10 -78Z" fill="#e3c27a" />
            <rect x="-10" y="-80" width="20" height="3" fill="#8a5a2a" />
          </>
        ) : null}
      </g>
    </g>
  );
}

const CREW: Record<string, { role: Role; u: number; v: number }> = {
  AVI: { role: "pilot", u: 0.66, v: -0.22 },
  ENG: { role: "tech", u: 0.62, v: -0.3 },
  CUL: { role: "chef", u: 0.98, v: -0.32 },
  MED: { role: "nurse", u: 0.62, v: -0.24 },
  AGR: { role: "farmer", u: 0.58, v: -0.08 },
};

/** Simple glyph per world for the sign (plane, bolt, chef hat, cross, sprout). */
function WorldGlyph({ code }: { code: string }) {
  switch (code) {
    case "AVI":
      return (
        <path
          d="M-11 2 L9 -1 Q13 0 9 1 L-11 4 Z M-2 -1 L-7 -9 L-3 -9 L4 -1Z M-2 3 L-7 10 L-3 10 L4 3Z"
          fill="#0B0F14"
        />
      );
    case "ENG":
      return <path d="M2 -11 L-7 2 L-1 2 L-3 11 L7 -2 L1 -2Z" fill="#0B0F14" />;
    case "CUL":
      return (
        <g fill="#0B0F14">
          <rect x="-6" y="0" width="12" height="7" />
          <circle cx="-5" cy="-2" r="4.5" />
          <circle cx="0" cy="-5" r="5" />
          <circle cx="5" cy="-2" r="4.5" />
        </g>
      );
    case "MED":
      return (
        <g fill="#0B0F14">
          <rect x="-3" y="-9" width="6" height="18" rx="1" />
          <rect x="-9" y="-3" width="18" height="6" rx="1" />
        </g>
      );
    default:
      return (
        <g fill="#0B0F14">
          <rect x="-1" y="-3" width="2" height="12" />
          <path d="M0 -1 Q-9 -4 -10 -11 Q-2 -9 0 -3Z" />
          <path d="M0 -4 Q9 -8 10 -14 Q2 -12 0 -6Z" />
        </g>
      );
  }
}

/** Job character and a sign naming the world, so each set is unmistakable. */
function WorldCrew({ code, colour, name }: { code: string; colour: string; name: string }) {
  const crew = CREW[code] ?? CREW.AGR!;
  const [wx, wy] = iso(crew.u, crew.v);
  const [sx, sy] = iso(0.08, -0.98, 150);
  return (
    <g>
      <g transform={`translate(${wx} ${wy}) scale(1.6)`}>
        <Worker role={crew.role} colour={colour} />
      </g>
      <g transform={`translate(${sx} ${sy})`}>
        <g className="js-rise">
          <rect x="-3" y="20" width="6" height="70" fill="#46525e" />
          <rect
            x="-78"
            y="-22"
            width="156"
            height="44"
            rx="12"
            fill="#0B0F14"
            stroke={colour}
            strokeWidth="3"
          />
          <circle cx="-54" cy="0" r="15" fill={colour} />
          <g transform="translate(-54 0)">
            <WorldGlyph code={code} />
          </g>
          <text x="-32" y="7" fill="#ffffff" fontSize="20" fontWeight="800">
            {name}
          </text>
        </g>
      </g>
    </g>
  );
}

/** Each world's isometric set on the back-right stage (u 0.1..1, v -1..-0.15). */
function WorldSet({ code, colour }: { code: string; colour: string }) {
  switch (code) {
    case "AVI": {
      const runway = poly([iso(0.22, -0.15), iso(0.48, -0.15), iso(0.48, -1), iso(0.22, -1)]);
      const lift = iso(0.35, -0.3);
      return (
        <g>
          <polygon points={runway} fill="#2a3036" />
          {[-0.3, -0.5, -0.7, -0.9].map((v) => (
            <polygon
              key={v}
              points={poly([iso(0.34, v), iso(0.36, v), iso(0.36, v - 0.08), iso(0.34, v - 0.08)])}
              fill="#f5f7fa"
              opacity="0.8"
            />
          ))}
          {[-0.2, -0.4, -0.6, -0.8, -0.98].map((v, i) => (
            <circle
              key={v}
              cx={iso(0.23, v)[0]}
              cy={iso(0.23, v)[1]}
              r="3"
              fill={colour}
              className="js-flash"
              style={{ animationDelay: i * 0.15 + "s" }}
            />
          ))}
          <Block
            u={0.78}
            v={-0.7}
            du={0.17}
            dv={0.2}
            h={70}
            top="#4a5560"
            side="#36404a"
            dark="#262e36"
          />
          <polygon
            points={poly([
              iso(0.95, -0.85, 4),
              iso(0.95, -0.55, 4),
              iso(0.95, -0.55, 50),
              iso(0.95, -0.85, 50),
            ])}
            fill={colour}
            opacity="0.35"
          />
          <g
            className="js-takeoff"
            style={{ ["--fx" as string]: `${lift[0]}px`, ["--fy" as string]: `${lift[1]}px` }}
          >
            <g transform="rotate(-30) scale(1.9)">
              <path d="M-34 0 L30 -5 Q40 0 30 5 Z" fill="#f5f7fa" />
              <path d="M-4 -2 L-18 -26 L-8 -26 L12 -2Z" fill={colour} />
              <path d="M-4 2 L-18 26 L-8 26 L12 2Z" fill={colour} />
              <path d="M-30 -1 L-38 -14 L-32 -14 L-24 -1Z" fill={colour} />
              <circle cx="22" cy="0" r="2" fill="#0B0F14" />
            </g>
          </g>
        </g>
      );
    }
    case "ENG": {
      const [gx, gy] = iso(0.55, -0.6, 64);
      return (
        <g>
          <Block
            u={0.55}
            v={-0.55}
            du={0.3}
            dv={0.14}
            h={56}
            top="#6b4a2a"
            side="#55391f"
            dark="#3f2a17"
          />
          <Block
            u={0.3}
            v={-0.62}
            du={0.06}
            dv={0.05}
            h={18}
            z={56}
            top="#c0392b"
            side="#9e2f23"
            dark="#7d251c"
          />
          <Block
            u={0.85}
            v={-0.85}
            du={0.12}
            dv={0.1}
            h={40}
            top={colour}
            side="#d6912f"
            dark="#a86f22"
          />
          <g transform={`translate(${gx} ${gy})`}>
            <rect
              x="-26"
              y="-8"
              width="46"
              height="14"
              rx="5"
              fill="#3a434c"
              transform="rotate(-20)"
            />
            <circle cx="22" cy="-6" r="11" fill="#9aa4b1" />
            {Array.from({ length: 9 }, (_, i) => (
              <rect
                key={i}
                x="30"
                y="-8"
                width="4"
                height="4"
                fill={i % 2 ? "#FFB547" : "#fff3c4"}
                className="js-grind"
                style={{
                  animationDelay: i * 0.09 + "s",
                  ["--sx" as string]: 20 + (i % 3) * 18 + "px",
                  ["--sy" as string]: -30 - (i % 4) * 12 + "px",
                }}
              />
            ))}
          </g>
          <g transform={`translate(${iso(0.9, -0.35, 110)[0]} ${iso(0.9, -0.35, 110)[1]})`}>
            <g className="js-spin">
              <circle r="34" fill="none" stroke={colour} strokeWidth="13" strokeDasharray="9 7" />
              <circle r="21" fill="#1a1f12" stroke={colour} strokeWidth="5" />
            </g>
            <g transform="translate(46 30)">
              <g className="js-spin-rev">
                <circle r="21" fill="none" stroke="#f5f7fa" strokeWidth="9" strokeDasharray="6 5" />
                <circle r="12" fill="#1a1f12" stroke="#f5f7fa" strokeWidth="4" />
              </g>
            </g>
          </g>
        </g>
      );
    }
    case "CUL": {
      const [px, py] = iso(0.62, -0.55, 60);
      return (
        <g>
          <Block
            u={0.58}
            v={-0.55}
            du={0.36}
            dv={0.16}
            h={60}
            top="#d9dee4"
            side="#aab3bd"
            dark="#7f8894"
          />
          <polygon
            points={poly([
              iso(0.32, -0.62, 61),
              iso(0.46, -0.62, 61),
              iso(0.46, -0.48, 61),
              iso(0.32, -0.48, 61),
            ])}
            fill="#b07a45"
          />
          {[0.36, 0.4].map((u) => (
            <circle
              key={u}
              cx={iso(u, -0.55, 64)[0]}
              cy={iso(u, -0.55, 64)[1]}
              r="4"
              fill="#e74c3c"
            />
          ))}
          <g transform={`translate(${px} ${py})`}>
            <ellipse
              cx="0"
              cy="4"
              rx="40"
              ry="11"
              fill={colour}
              opacity="0.6"
              className="js-flash"
            />
            <ellipse cx="0" cy="0" rx="34" ry="11" fill="#3a3436" />
            <rect x="-34" y="-34" width="68" height="34" fill="#4a4446" />
            <ellipse
              cx="0"
              cy="-34"
              rx="34"
              ry="11"
              fill="#2a2526"
              stroke={colour}
              strokeWidth="3"
            />
            <rect x="-48" y="-28" width="14" height="5" rx="2.5" fill="#4a4446" />
            <rect x="34" y="-28" width="14" height="5" rx="2.5" fill="#4a4446" />
            {[-14, 0, 14].map((dx, i) => (
              <path
                key={dx}
                d={`M${dx} -46 q-9 -16 0 -32 q9 -16 0 -32`}
                fill="none"
                stroke="#f5f7fa"
                strokeOpacity="0.75"
                strokeWidth="5"
                strokeLinecap="round"
                className="js-steam"
                style={{ animationDelay: i * 0.45 + "s" }}
              />
            ))}
          </g>
          <Block
            u={0.92}
            v={-0.92}
            du={0.06}
            dv={0.06}
            h={90}
            top="#d9dee4"
            side="#aab3bd"
            dark="#7f8894"
          />
          <rect
            x={iso(0.92, -0.92, 92)[0] - 10}
            y={iso(0.92, -0.92, 92)[1] - 18}
            width="20"
            height="16"
            rx="8"
            fill="#f5f7fa"
          />
        </g>
      );
    }
    case "MED": {
      const [mx, my] = iso(0.92, -0.75, 120);
      return (
        <g>
          <Block
            u={0.5}
            v={-0.55}
            du={0.34}
            dv={0.14}
            h={30}
            z={14}
            top="#e3e8ef"
            side="#b9c2cc"
            dark="#8d97a3"
          />
          {[
            [0.2, -0.43],
            [0.8, -0.43],
            [0.2, -0.67],
            [0.8, -0.67],
          ].map(([u, v]) => (
            <Block
              key={`${u}${v}`}
              u={u!}
              v={v!}
              du={0.02}
              dv={0.02}
              h={14}
              top="#6b7480"
              side="#5a636e"
              dark="#4a525c"
            />
          ))}
          <Block
            u={0.24}
            v={-0.55}
            du={0.07}
            dv={0.11}
            h={10}
            z={44}
            top="#ffffff"
            side="#dde3ea"
            dark="#c3cbd5"
          />
          <polygon
            points={poly([
              iso(0.36, -0.69, 45),
              iso(0.84, -0.69, 45),
              iso(0.84, -0.41, 45),
              iso(0.36, -0.41, 45),
            ])}
            fill={colour}
            opacity="0.65"
          />
          <g transform={`translate(${mx} ${my})`}>
            <rect
              x="-62"
              y="-40"
              width="124"
              height="80"
              rx="10"
              fill="#0e1a19"
              stroke={colour}
              strokeWidth="2.5"
            />
            <path
              d="M-54 0 L-26 0 L-19 -20 L-9 24 L0 -28 L8 0 L54 0"
              fill="none"
              stroke={colour}
              strokeWidth="3.5"
              strokeLinejoin="round"
              className="js-ecg"
            />
            <rect x="-3" y="40" width="6" height="40" fill="#6b7480" />
          </g>
          <g transform={`translate(${iso(0.15, -0.95, 150)[0]} ${iso(0.15, -0.95, 150)[1]})`}>
            <g className="js-beat">
              <rect x="-8" y="-22" width="16" height="44" rx="4" fill="#ff5a5a" />
              <rect x="-22" y="-8" width="44" height="16" rx="4" fill="#ff5a5a" />
            </g>
          </g>
        </g>
      );
    }
    default: {
      const corners = [iso(0.15, -0.95), iso(0.95, -0.95), iso(0.95, -0.2), iso(0.15, -0.2)];
      const roof = corners.map(([x, y]) => [x, y - 120] as [number, number]);
      return (
        <g>
          <polygon points={poly(corners)} fill="#3b2a1a" />
          {[-0.35, -0.55, -0.75].map((v) => (
            <polygon
              key={v}
              points={poly([
                iso(0.2, v - 0.04),
                iso(0.9, v - 0.04),
                iso(0.9, v + 0.04),
                iso(0.2, v + 0.04),
              ])}
              fill="#4e3622"
            />
          ))}
          {[-0.35, -0.55, -0.75].flatMap((v, r) =>
            [0.28, 0.46, 0.64, 0.82].map((u, c) => {
              const [sx, sy] = iso(u, v);
              return (
                <g key={`${r}${c}`} transform={`translate(${sx} ${sy})`}>
                  <g className="js-grow" style={{ animationDelay: (r * 4 + c) * 0.08 + "s" }}>
                    <rect x="-1.5" y="-26" width="3" height="26" fill="#5d8a2a" />
                    <path d="M0 -16 Q-15 -22 -16 -34 Q-4 -30 0 -19Z" fill={colour} />
                    <path d="M0 -22 Q15 -30 16 -42 Q4 -38 0 -25Z" fill="#c8e070" />
                  </g>
                </g>
              );
            }),
          )}
          <g fill="none" stroke="#c8e070" strokeOpacity="0.7" strokeWidth="2">
            {corners.map(([x, y], i) => (
              <line key={i} x1={x} y1={y} x2={x} y2={y - 120} />
            ))}
            <polygon points={poly(roof)} fill="#ABCF37" fillOpacity="0.08" />
            <line x1={roof[0]![0]} y1={roof[0]![1]} x2={roof[2]![0]} y2={roof[2]![1]} />
          </g>
          <g transform={`translate(${iso(0.55, -0.6, 150)[0]} ${iso(0.55, -0.6, 150)[1]})`}>
            <circle r="18" fill="#ffd166" className="js-beat" />
          </g>
        </g>
      );
    }
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
  // Unique gradient ids: the phone banner and desktop panel both render a scene on one page.
  const uid = "js" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [tick, setTick] = useState(0);
  const [visible, setVisible] = useState(true);
  const paused = useSyncExternalStore(subscribePaused, readPaused, () => false);
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
  const kiosk = isoBox(KIOSK.u, KIOSK.v, 0.12, 0.09, 125);
  const kioskScreen = poly([
    iso(KIOSK.u + 0.12, KIOSK.v - 0.07, 115),
    iso(KIOSK.u + 0.12, KIOSK.v + 0.07, 115),
    iso(KIOSK.u + 0.12, KIOSK.v + 0.07, 55),
    iso(KIOSK.u + 0.12, KIOSK.v - 0.07, 55),
  ]);
  const gateL = isoBox(GATE.u - 0.16, GATE.v + 0.16, 0.045, 0.045, 180);
  const gateR = isoBox(GATE.u + 0.16, GATE.v - 0.16, 0.045, 0.045, 180);
  const gateTopA = iso(GATE.u - 0.16, GATE.v + 0.16, 188);
  const gateTopB = iso(GATE.u + 0.16, GATE.v - 0.16, 188);

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
          <radialGradient id={uid + "-sky"} cx="60%" cy="42%" r="80%">
            <stop offset="0%" stopColor="#1b2a33" />
            <stop offset="55%" stopColor="#0e151b" />
            <stop offset="100%" stopColor="#0B0F14" />
          </radialGradient>
          <radialGradient id={uid + "-glow"} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={world.colour} stopOpacity="0.6" />
            <stop offset="55%" stopColor={world.colour} stopOpacity="0.14" />
            <stop offset="100%" stopColor={world.colour} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={uid + "-island-glow"} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ABCF37" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ABCF37" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={uid + "-top"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3d6a26" />
            <stop offset="100%" stopColor="#25461b" />
          </linearGradient>
          <linearGradient id={uid + "-beam"} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ABCF37" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ABCF37" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* far layer */}
        <g className="js-layer-far">
          <rect x="-40" y="-40" width="880" height="1080" fill={"url(#" + uid + "-sky" + ")"} />
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
          <circle cx={PROP[0]} cy={PROP[1] - 60} r="360" fill={"url(#" + uid + "-glow" + ")"} />
          {(
            [
              [130, 260, 0.34],
              [720, 210, 0.26],
              [700, 900, 0.3],
            ] as [number, number, number][]
          ).map(([x, y, s], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity="0.6">
              <g className="js-drift" style={{ animationDelay: -i * 2 + "s" }}>
                <polygon
                  points="0,-60 115,0 0,60 -115,0"
                  fill="#24391b"
                  stroke="#ABCF37"
                  strokeOpacity="0.6"
                  strokeWidth="4"
                />
                <polygon points="-115,0 0,60 0,110 -115,50" fill="#13200f" />
                <polygon points="0,60 115,0 115,50 0,110" fill="#0e170c" />
              </g>
            </g>
          ))}
          {/* drifting clouds */}
          {(
            [
              [60, 140, 1],
              [520, 90, 0.8],
              [300, 380, 0.65],
            ] as [number, number, number][]
          ).map(([x, y, sc], i) => (
            <g key={"cl" + i} transform={`translate(${x} ${y}) scale(${sc})`} opacity="0.16">
              <g className="js-cloud" style={{ animationDelay: -i * 9 + "s" }}>
                <ellipse cx="0" cy="0" rx="70" ry="18" fill="#ffffff" />
                <ellipse cx="-24" cy="-12" rx="30" ry="18" fill="#ffffff" />
                <ellipse cx="18" cy="-16" rx="36" ry="22" fill="#ffffff" />
              </g>
            </g>
          ))}
          {/* drones */}
          {[0, 1].map((i) => (
            <g key={"dr" + i} transform={`translate(0 ${170 + i * 140})`}>
              <g
                className="js-drone"
                style={{ animationDelay: -i * 5 + "s", animationDuration: 11 + i * 3 + "s" }}
              >
                <rect x="-14" y="-3" width="28" height="6" rx="3" fill="#9aa4b1" />
                <rect x="-20" y="-6" width="12" height="2" rx="1" fill="#e3e8ef" />
                <rect x="8" y="-6" width="12" height="2" rx="1" fill="#e3e8ef" />
                <circle cx="0" cy="5" r="3" fill={i ? "#FF6B5A" : "#ABCF37"} className="js-flash" />
              </g>
            </g>
          ))}
        </g>

        {/* island layer */}
        <g className="js-layer-mid">
          <g className="js-float">
            <ellipse
              cx={IX}
              cy={IY + 40}
              rx="420"
              ry="220"
              fill={"url(#" + uid + "-island-glow" + ")"}
            />
            <ellipse cx={IX} cy={IY + 290} rx="300" ry="50" fill="#000" opacity="0.4" />
            <polygon
              points={poly([iso(-1, 1), iso(1, 1), iso(1, 1, -80), iso(-1, 1, -80)])}
              fill="#173012"
            />
            <polygon
              points={poly([iso(1, 1), iso(1, -1), iso(1, -1, -80), iso(1, 1, -80)])}
              fill="#0f220c"
            />
            <polygon
              points={poly([
                iso(-1, 1, -80),
                iso(1, 1, -80),
                iso(1, -1, -80),
                [IX + 60, IY + 330],
                [IX - 70, IY + 350],
              ])}
              fill="#0a140a"
            />
            <polygon
              points={poly([iso(-1, -1), iso(1, -1), iso(1, 1), iso(-1, 1)])}
              fill={"url(#" + uid + "-top" + ")"}
            />
            <g stroke="#c8e070" strokeOpacity="0.3">
              {[-0.5, 0, 0.5].map((k) => (
                <g key={k}>
                  <line x1={iso(k, -1)[0]} y1={iso(k, -1)[1]} x2={iso(k, 1)[0]} y2={iso(k, 1)[1]} />
                  <line x1={iso(-1, k)[0]} y1={iso(-1, k)[1]} x2={iso(1, k)[0]} y2={iso(1, k)[1]} />
                </g>
              ))}
            </g>
            <polygon
              points={poly([iso(-1, -1), iso(1, -1), iso(1, 1), iso(-1, 1)])}
              fill="none"
              stroke="#c8e070"
              strokeWidth="3"
              className="js-edge"
            />

            {/* expo kiosk with a headset on a hook */}
            <polygon points={kiosk.left} fill="#2f3842" />
            <polygon points={kiosk.right} fill="#222a33" />
            <polygon points={kiosk.top} fill="#46525e" />
            <polygon points={kioskScreen} fill={world.colour} className="js-screen" />
            <rect
              x={iso(KIOSK.u + 0.12, KIOSK.v, 60)[0] - 9}
              y={iso(KIOSK.u + 0.12, KIOSK.v, 60)[1] - 28}
              width="18"
              height="7"
              rx="3"
              fill="#ABCF37"
              opacity={act === 1 || act === 2 ? 0 : 1}
            />

            {/* flag on the kiosk */}
            <g
              transform={`translate(${iso(KIOSK.u - 0.1, KIOSK.v - 0.08, 125)[0]} ${iso(KIOSK.u - 0.1, KIOSK.v - 0.08, 125)[1]})`}
            >
              <rect x="-1.5" y="-60" width="3" height="60" fill="#c3cbd5" />
              <g className="js-flag">
                <path d="M1.5 -60 L42 -50 L1.5 -40Z" fill="#ABCF37" />
                <circle cx="14" cy="-50" r="4" fill="#0B0F14" />
              </g>
            </g>
            {/* learners queuing for the kiosk */}
            {(
              [
                [-0.92, -0.42, "#4FA3FF", "#3a82d1", "#5c3a22"],
                [-0.98, -0.12, "#FF6B5A", "#d4544a", "#8a5a3a"],
              ] as [number, number, string, string, string][]
            ).map(([u, v, h, sh, sk], i) => (
              <g key={"q" + i} transform={`translate(${iso(u, v)[0]} ${iso(u, v)[1]}) scale(1.45)`}>
                <Learner walking={false} headset={false} hoodie={h} shade={sh} skin={sk} idle />
              </g>
            ))}
            {/* chasing lights along the front edges */}
            {Array.from({ length: 12 }, (_, i) => {
              const [ex, ey] = i < 6 ? iso(-1 + (i / 5) * 2, 1) : iso(1, 1 - ((i - 6) / 5) * 2);
              return (
                <circle
                  key={"e" + i}
                  cx={ex}
                  cy={ey + 2}
                  r="3.5"
                  fill={i % 2 ? "#ABCF37" : "#f5f7fa"}
                  className="js-chase"
                  style={{ animationDelay: i * 0.12 + "s" }}
                />
              );
            })}

            {/* act scenes, remounted per act so their animations restart */}
            <g key={key} className="js-act">
              {act === 1 ? (
                <g>
                  <g className="js-portal">
                    <circle
                      cx={PROP[0]}
                      cy={PROP[1] - 110}
                      r="150"
                      fill={world.colour}
                      fillOpacity="0.14"
                      stroke={world.colour}
                      strokeWidth="9"
                    />
                    <circle
                      cx={PROP[0]}
                      cy={PROP[1] - 110}
                      r="130"
                      fill="none"
                      stroke="#ffffff"
                      strokeOpacity="0.35"
                      strokeWidth="2"
                      strokeDasharray="4 10"
                    />
                  </g>
                  <WorldSet code={world.code} colour={world.colour} />
                  <WorldCrew code={world.code} colour={world.colour} name={name} />
                </g>
              ) : null}
              {act === 2 ? (
                <g>
                  <g className="js-pop">
                    <rect
                      x={PROP[0] - 130}
                      y={PROP[1] - 210}
                      width="260"
                      height="116"
                      rx="22"
                      fill="#0B0F14"
                      fillOpacity="0.9"
                      stroke={world.colour}
                      strokeWidth="3"
                    />
                    <circle cx={PROP[0] - 82} cy={PROP[1] - 152} r="26" fill={world.colour} />
                    <text
                      x={PROP[0] - 44}
                      y={PROP[1] - 166}
                      fill="#ffffff"
                      fillOpacity="0.85"
                      fontSize="20"
                      fontWeight="600"
                    >
                      {name}
                    </text>
                    <text
                      x={PROP[0] - 44}
                      y={PROP[1] - 120}
                      fill="#ffffff"
                      fontSize="46"
                      fontWeight="800"
                    >
                      {world.score}
                    </text>
                  </g>
                  {Array.from({ length: 12 }, (_, i) => (
                    <rect
                      key={i}
                      x={PROP[0] - 150 + i * 26}
                      y={PROP[1] - 30}
                      width="8"
                      height="8"
                      fill={i % 2 ? "#ABCF37" : world.colour}
                      className="js-spark"
                      style={{ animationDelay: (i % 6) * 0.15 + "s" }}
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
                      style={{ animationDelay: i * 0.25 + "s" }}
                    />
                  ))}
                  <g className="js-rise">
                    <polygon points={gateL.left} fill="#2f3842" />
                    <polygon points={gateL.right} fill="#222a33" />
                    <polygon points={gateL.top} fill="#ABCF37" />
                    <polygon points={gateR.left} fill="#2f3842" />
                    <polygon points={gateR.right} fill="#222a33" />
                    <polygon points={gateR.top} fill="#ABCF37" />
                    <polygon
                      points={poly([
                        iso(GATE.u - 0.13, GATE.v + 0.13, 172),
                        iso(GATE.u + 0.13, GATE.v - 0.13, 172),
                        iso(GATE.u + 0.13, GATE.v - 0.13, 4),
                        iso(GATE.u - 0.13, GATE.v + 0.13, 4),
                      ])}
                      fill={"url(#" + uid + "-beam" + ")"}
                      className="js-gate-glow"
                    />
                    <line
                      x1={gateTopA[0]}
                      y1={gateTopA[1]}
                      x2={gateTopB[0]}
                      y2={gateTopB[1]}
                      stroke="#ABCF37"
                      strokeWidth="13"
                      strokeLinecap="round"
                    />
                    <g
                      transform={`translate(${(gateTopA[0] + gateTopB[0]) / 2} ${(gateTopA[1] + gateTopB[1]) / 2 - 50})`}
                    >
                      <g className="js-bounce">
                        <circle r="28" fill="#0B0F14" stroke="#ABCF37" strokeWidth="3" />
                        <rect x="-14" y="-8" width="28" height="19" rx="3" fill="#ABCF37" />
                        <path d="M-6 -8 V-13 H6 V-8" fill="none" stroke="#ABCF37" strokeWidth="3" />
                      </g>
                    </g>
                    <g transform={`translate(${MENTOR[0]} ${MENTOR[1]}) scale(1.6)`}>
                      <Mentor />
                    </g>
                  </g>
                  <g transform={`translate(${STAND[0]} ${STAND[1] - 185})`}>
                    <g className="js-pop">
                      <circle r="32" fill="#0B0F14" stroke="#ABCF37" strokeWidth="3" />
                      <g className="js-needle">
                        <path d="M0 -24 L8 0 L0 24 L-8 0Z" fill="#ABCF37" />
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
              <g transform="scale(1.7)">
                <Learner walking={walking} headset={act === 1 || act === 2} />
              </g>
            </g>
          </g>
        </g>

        {/* near layer: floating motes */}
        <g className="js-layer-near">
          {(
            [
              [80, 720],
              [750, 520],
              [640, 960],
              [210, 940],
            ] as [number, number][]
          ).map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(45)`}>
              <rect
                x="-6"
                y="-6"
                width="12"
                height="12"
                fill="#ABCF37"
                opacity="0.7"
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
          className="js-caption pointer-events-none absolute top-[13%] right-[7%] max-w-[15rem] rounded-2xl border border-white/20 bg-black/55 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_-10px_rgba(0,0,0,0.8)]"
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
