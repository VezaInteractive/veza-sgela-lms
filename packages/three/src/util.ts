/**
 * Pure helpers shared by the 3D components (unit tested; no three.js import here so callers can
 * use them without pulling three into a bundle).
 */

/** True when the browser can create a WebGL context. Always false on the server. */
export function hasWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

interface NetworkInfo {
  saveData?: boolean;
  effectiveType?: string;
}

/** Browser data-saver hint (Network Information API; Chrome/Android only). */
export function browserSavesData(): boolean {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as Navigator & { connection?: NetworkInfo }).connection;
  if (!c) return false;
  return !!c.saveData || ["slow-2g", "2g", "3g"].includes(c.effectiveType ?? "");
}

/** "19 KB", "1.4 MB": size shown on the 3D size gate. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return Math.max(1, bytes) + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export interface CompassNode {
  code: string;
  interest: number;
}

/**
 * Layout for the Compass: worlds on a pentagon (first world at the back, centre), size and glow
 * grow with interest (0-100). Units are scene units.
 */
export function compassLayout(nodes: CompassNode[], ring = 2.2) {
  return nodes.map((n, i) => {
    const angle = Math.PI / 2 + (i * 2 * Math.PI) / Math.max(1, nodes.length);
    const t = Math.max(0, Math.min(100, n.interest)) / 100;
    return {
      code: n.code,
      x: Math.cos(angle) * ring,
      z: -Math.sin(angle) * ring,
      radius: 0.22 + 0.33 * t,
      height: 0.35 + 1.1 * t,
      glow: 0.15 + 0.85 * t,
    };
  });
}
