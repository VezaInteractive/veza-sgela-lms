/**
 * Generates the five seed 3D hero objects (M2-2) as small GLB files plus WebP posters in
 * public/models. Low-poly, built from primitives in code so the repo carries no third-party
 * art. Real partner/artist assets replace these via the asset pipeline in M3 (PRD 13.5).
 * Run: pnpm --filter @sgela/web models:seed
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Document, NodeIO, type Material, type Mesh } from "@gltf-transform/core";
import sharp from "sharp";

type V3 = [number, number, number];
type Quat = [number, number, number, number];

const OUT = join(import.meta.dirname, "..", "public", "models");

function quat(axis: "x" | "y" | "z", deg: number): Quat {
  const r = (deg * Math.PI) / 360;
  const s = Math.sin(r);
  const c = Math.cos(r);
  if (axis === "x") return [s, 0, 0, c];
  if (axis === "y") return [0, s, 0, c];
  return [0, 0, s, c];
}

interface Geo {
  pos: number[];
  nrm: number[];
  idx: number[];
}

/** Unit box centred on the origin (size 1). */
function box(): Geo {
  const pos: number[] = [];
  const nrm: number[] = [];
  const idx: number[] = [];
  const faces: [V3, V3, V3][] = [
    [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    [
      [-1, 0, 0],
      [0, 0, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 0],
    ],
    [
      [0, -1, 0],
      [1, 0, 0],
      [0, 0, 1],
    ],
    [
      [0, 0, 1],
      [1, 0, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, -1],
      [0, 1, 0],
      [1, 0, 0],
    ],
  ];
  for (const [n, u, v] of faces) {
    const base = pos.length / 3;
    for (const [a, b] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ] as const) {
      for (let k = 0; k < 3; k++) pos.push(0.5 * (n[k]! + a * u[k]! + b * v[k]!));
      nrm.push(...n);
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return { pos, nrm, idx };
}

/** Cylinder along Y, radius 0.5, height 1; topScale 0 makes a cone. */
function cylinder(seg = 24, topScale = 1): Geo {
  const pos: number[] = [];
  const nrm: number[] = [];
  const idx: number[] = [];
  const slope = 0.5 * (1 - topScale);
  const len = Math.hypot(1, slope);
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    pos.push(0.5 * c, -0.5, 0.5 * s, 0.5 * topScale * c, 0.5, 0.5 * topScale * s);
    nrm.push(c / len, slope / len, s / len, c / len, slope / len, s / len);
  }
  for (let i = 0; i < seg; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 3, a, a + 3, a + 2);
  }
  const caps: [number, number, number][] = [
    [0.5, 1, topScale],
    [-0.5, -1, 1],
  ];
  for (const [y, sign, scale] of caps) {
    if (scale === 0) continue;
    const centre = pos.length / 3;
    pos.push(0, y, 0);
    nrm.push(0, sign, 0);
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      pos.push(0.5 * scale * Math.cos(a), y, 0.5 * scale * Math.sin(a));
      nrm.push(0, sign, 0);
    }
    for (let i = 0; i < seg; i++) {
      if (sign > 0) idx.push(centre, centre + 2 + i, centre + 1 + i);
      else idx.push(centre, centre + 1 + i, centre + 2 + i);
    }
  }
  return { pos, nrm, idx };
}

/** UV sphere, radius 0.5. */
function sphere(w = 16, h = 10): Geo {
  const pos: number[] = [];
  const nrm: number[] = [];
  const idx: number[] = [];
  for (let y = 0; y <= h; y++) {
    const v = (y / h) * Math.PI;
    for (let x = 0; x <= w; x++) {
      const u = (x / w) * Math.PI * 2;
      const n: V3 = [Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u)];
      pos.push(n[0] * 0.5, n[1] * 0.5, n[2] * 0.5);
      nrm.push(...n);
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = y * (w + 1) + x;
      const b = a + w + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  return { pos, nrm, idx };
}

interface Part {
  geo: "box" | "cyl" | "cone" | "sphere";
  color: string;
  t: V3;
  s: V3;
  r?: Quat;
  metal?: number;
  name: string;
}

/** sRGB hex to linear RGBA (glTF base colour is linear). */
function linear(c: string): [number, number, number, number] {
  const n = parseInt(c.slice(1), 16);
  const ch = (v: number) => Math.pow(v / 255, 2.2);
  return [ch((n >> 16) & 255), ch((n >> 8) & 255), ch(n & 255), 1];
}

function build(name: string, parts: Part[]): Document {
  const doc = new Document();
  doc.getRoot().getAsset().generator = "veza-sgela seed models";
  const buffer = doc.createBuffer();
  const scene = doc.createScene(name);
  const meshes = new Map<string, Mesh>();
  const mats = new Map<string, Material>();
  const geos = { box: box(), cyl: cylinder(), cone: cylinder(24, 0), sphere: sphere() };
  for (const p of parts) {
    const matKey = p.color + ":" + (p.metal ?? 0.1);
    let mat = mats.get(matKey);
    if (!mat) {
      mat = doc
        .createMaterial(matKey)
        .setBaseColorFactor(linear(p.color))
        .setMetallicFactor(p.metal ?? 0.1)
        .setRoughnessFactor(0.55);
      mats.set(matKey, mat);
    }
    const meshKey = p.geo + ":" + matKey;
    let mesh = meshes.get(meshKey);
    if (!mesh) {
      const g = geos[p.geo];
      const prim = doc
        .createPrimitive()
        .setAttribute(
          "POSITION",
          doc.createAccessor().setType("VEC3").setArray(new Float32Array(g.pos)).setBuffer(buffer),
        )
        .setAttribute(
          "NORMAL",
          doc.createAccessor().setType("VEC3").setArray(new Float32Array(g.nrm)).setBuffer(buffer),
        )
        .setIndices(
          doc.createAccessor().setType("SCALAR").setArray(new Uint16Array(g.idx)).setBuffer(buffer),
        )
        .setMaterial(mat);
      mesh = doc.createMesh(meshKey).addPrimitive(prim);
      meshes.set(meshKey, mesh);
    }
    const node = doc.createNode(p.name).setMesh(mesh).setTranslation(p.t).setScale(p.s);
    if (p.r) node.setRotation(p.r);
    scene.addChild(node);
  }
  return doc;
}

const ring = (n: number, i: number) => (i * 2 * Math.PI) / n;

const MODELS: { file: string; label: string; colour: string; parts: Part[] }[] = [
  {
    file: "avi-jet-engine",
    label: "Jet engine",
    colour: "#4FA3FF",
    parts: [
      {
        geo: "cyl",
        color: "#C9D3DE",
        t: [0, 0, 0],
        s: [1.6, 2.4, 1.6],
        r: quat("x", 90),
        metal: 0.7,
        name: "nacelle",
      },
      {
        geo: "cyl",
        color: "#2B3440",
        t: [0, 0, 1.21],
        s: [1.45, 0.02, 1.45],
        r: quat("x", 90),
        name: "intake",
      },
      ...Array.from({ length: 12 }, (_, i): Part => ({
        geo: "box",
        color: "#8FA3B8",
        t: [0.38 * Math.cos(ring(12, i)), 0.38 * Math.sin(ring(12, i)), 1.24],
        s: [0.6, 0.12, 0.03],
        r: quat("z", i * 30 + 20),
        metal: 0.8,
        name: "fan-blade-" + (i + 1),
      })),
      {
        geo: "cone",
        color: "#4FA3FF",
        t: [0, 0, 1.45],
        s: [0.45, 0.5, 0.45],
        r: quat("x", 90),
        metal: 0.4,
        name: "spinner",
      },
      {
        geo: "cyl",
        color: "#5B6573",
        t: [0, 0, -1.45],
        s: [0.9, 0.6, 0.9],
        r: quat("x", 90),
        metal: 0.8,
        name: "exhaust",
      },
      { geo: "box", color: "#9AA8B6", t: [0, 0.95, 0], s: [0.2, 0.5, 1.6], name: "pylon" },
    ],
  },
  {
    file: "eng-angle-grinder",
    label: "Angle grinder",
    colour: "#FFB547",
    parts: [
      {
        geo: "cyl",
        color: "#FFB547",
        t: [-0.5, 0, 0],
        s: [0.55, 1.8, 0.55],
        r: quat("z", 90),
        name: "motor-body",
      },
      {
        geo: "cyl",
        color: "#2B2B2B",
        t: [-1.5, 0, 0],
        s: [0.45, 0.3, 0.45],
        r: quat("z", 90),
        name: "end-cap",
      },
      {
        geo: "box",
        color: "#555B63",
        t: [0.55, 0, 0],
        s: [0.55, 0.5, 0.6],
        metal: 0.6,
        name: "gear-head",
      },
      {
        geo: "cyl",
        color: "#7E8790",
        t: [0.7, -0.35, 0],
        s: [1.5, 0.05, 1.5],
        metal: 0.8,
        name: "cutting-disc",
      },
      { geo: "cyl", color: "#3A3F45", t: [0.55, -0.3, 0.3], s: [0.9, 0.04, 0.9], name: "guard" },
      {
        geo: "cyl",
        color: "#2B2B2B",
        t: [0.55, 0, 0.7],
        s: [0.18, 0.8, 0.18],
        r: quat("x", 90),
        name: "side-handle",
      },
      { geo: "box", color: "#E04F3B", t: [-0.6, 0.3, 0], s: [0.3, 0.08, 0.2], name: "switch" },
    ],
  },
  {
    file: "cul-stock-pot",
    label: "Stock pot",
    colour: "#FF6B5A",
    parts: [
      {
        geo: "box",
        color: "#3A3F45",
        t: [0, -0.55, 0],
        s: [2.4, 0.3, 2.4],
        metal: 0.6,
        name: "stove-top",
      },
      { geo: "cyl", color: "#1E2227", t: [0, -0.37, 0], s: [1.2, 0.06, 1.2], name: "burner" },
      ...Array.from({ length: 6 }, (_, i): Part => ({
        geo: "cone",
        color: i % 2 ? "#FFB547" : "#FF6B5A",
        t: [0.45 * Math.cos(ring(6, i)), -0.25, 0.45 * Math.sin(ring(6, i))],
        s: [0.16, 0.25, 0.16],
        name: "flame-" + (i + 1),
      })),
      {
        geo: "cyl",
        color: "#C9D3DE",
        t: [0, 0.35, 0],
        s: [1.5, 1.2, 1.5],
        metal: 0.85,
        name: "pot",
      },
      {
        geo: "box",
        color: "#9AA8B6",
        t: [0.86, 0.75, 0],
        s: [0.25, 0.1, 0.35],
        metal: 0.8,
        name: "handle-right",
      },
      {
        geo: "box",
        color: "#9AA8B6",
        t: [-0.86, 0.75, 0],
        s: [0.25, 0.1, 0.35],
        metal: 0.8,
        name: "handle-left",
      },
      {
        geo: "cyl",
        color: "#E8EEF3",
        t: [0, 0.98, 0],
        s: [1.45, 0.06, 1.45],
        metal: 0.6,
        name: "lid",
      },
      { geo: "sphere", color: "#2B2B2B", t: [0, 1.08, 0], s: [0.2, 0.15, 0.2], name: "lid-knob" },
    ],
  },
  {
    file: "med-clinic-bed",
    label: "Clinic bed",
    colour: "#3FD1B5",
    parts: [
      { geo: "box", color: "#E8EEF3", t: [0, 0.1, 0], s: [2.6, 0.25, 1.1], name: "mattress" },
      { geo: "box", color: "#3FD1B5", t: [0.15, 0.27, 0], s: [2.2, 0.08, 1.05], name: "sheet" },
      { geo: "box", color: "#FFFFFF", t: [-1, 0.3, 0], s: [0.5, 0.15, 0.8], name: "pillow" },
      {
        geo: "box",
        color: "#9AA8B6",
        t: [0, -0.1, 0],
        s: [2.7, 0.12, 1.15],
        metal: 0.6,
        name: "frame",
      },
      ...(
        [
          [-1.2, -0.45],
          [1.2, -0.45],
          [-1.2, 0.45],
          [1.2, 0.45],
        ] as const
      ).map(([x, z], i): Part => ({
        geo: "cyl",
        color: "#7E8790",
        t: [x, -0.55, z],
        s: [0.08, 0.8, 0.08],
        metal: 0.7,
        name: "leg-" + (i + 1),
      })),
      {
        geo: "box",
        color: "#9AA8B6",
        t: [-1.35, 0.45, 0],
        s: [0.08, 0.8, 1.15],
        metal: 0.6,
        name: "headboard",
      },
      {
        geo: "cyl",
        color: "#7E8790",
        t: [-1.7, 0.4, 0.8],
        s: [0.06, 2.2, 0.06],
        metal: 0.7,
        name: "monitor-pole",
      },
      { geo: "box", color: "#2B3440", t: [-1.7, 1.3, 0.8], s: [0.15, 0.55, 0.75], name: "monitor" },
      {
        geo: "box",
        color: "#3FD1B5",
        t: [-1.62, 1.3, 0.8],
        s: [0.02, 0.4, 0.6],
        name: "monitor-screen",
      },
    ],
  },
  {
    file: "agr-hydroponic-nft",
    label: "Hydroponic NFT system",
    colour: "#ABCF37",
    parts: [
      ...[-1.1, 1.1].flatMap((x, i): Part[] => [
        {
          geo: "box",
          color: "#9AA8B6",
          t: [x, 0.2, -0.2],
          s: [0.08, 1.8, 0.08],
          r: quat("x", -14),
          metal: 0.6,
          name: "frame-a-" + (i + 1),
        },
        {
          geo: "box",
          color: "#9AA8B6",
          t: [x, 0.2, 0.2],
          s: [0.08, 1.8, 0.08],
          r: quat("x", 14),
          metal: 0.6,
          name: "frame-b-" + (i + 1),
        },
      ]),
      ...[0, 1, 2].flatMap((row): Part[] => {
        const y = -0.35 + row * 0.5;
        const z = 0.42 - row * 0.12;
        return [
          {
            geo: "box",
            color: "#F2F5F8",
            t: [0, y, z],
            s: [2.5, 0.16, 0.2],
            name: "channel-" + (row + 1),
          },
          ...[-0.9, -0.3, 0.3, 0.9].map((x, k): Part => ({
            geo: "sphere",
            color: k % 2 ? "#6C861F" : "#ABCF37",
            t: [x, y + 0.2, z + 0.02],
            s: [0.3, 0.28, 0.3],
            name: "plant-" + (row + 1) + "-" + (k + 1),
          })),
        ];
      }),
      { geo: "box", color: "#2F3A10", t: [0, -0.85, 0], s: [1.2, 0.4, 0.6], name: "nutrient-tank" },
      {
        geo: "cyl",
        color: "#4FA3FF",
        t: [0.7, -0.4, 0.3],
        s: [0.06, 0.9, 0.06],
        name: "feed-pipe",
      },
    ],
  },
];

/** Branded poster shown before the 3D loads (and when WebGL is missing). */
function posterSvg(colour: string, label: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <radialGradient id="g" cx="50%" cy="45%" r="60%">
      <stop offset="0" stop-color="${colour}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#0B0F14" stop-opacity="1"/>
    </radialGradient>
  </defs>
  <rect width="800" height="600" fill="#0B0F14"/>
  <rect width="800" height="600" fill="url(#g)"/>
  <ellipse cx="400" cy="450" rx="230" ry="40" fill="#000" opacity="0.45"/>
  <g fill="none" stroke="${colour}" stroke-width="3" opacity="0.9">
    <circle cx="400" cy="290" r="140"/>
    <circle cx="400" cy="290" r="95" stroke-dasharray="6 10"/>
    <path d="M260 290h280M400 150v280"/>
  </g>
  <text x="400" y="545" text-anchor="middle" font-family="sans-serif" font-size="30" font-weight="700" fill="#FFFFFF" opacity="0.85">${label}</text>
</svg>`;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const io = new NodeIO();
  for (const m of MODELS) {
    const glb = await io.writeBinary(build(m.file, m.parts));
    writeFileSync(join(OUT, m.file + ".glb"), glb);
    const poster = await sharp(Buffer.from(posterSvg(m.colour, m.label)))
      .webp({ quality: 80 })
      .toBuffer();
    writeFileSync(join(OUT, m.file + ".webp"), poster);
    console.info(`${m.file}: glb ${glb.byteLength} B, poster ${poster.byteLength} B`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
