"use client";

import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { browserSavesData, hasWebGL } from "./util";

const CompassScene = lazy(() => import("./compass-scene"));

export interface CompassWorld {
  code: string;
  name: string;
  color: string;
  /** 0-100 */
  interest: number;
}

export interface CareerCompass3DProps {
  worlds: CompassWorld[];
  /** The 2D SVG compass: shown first, while 3D loads, and kept in data-saver mode or without WebGL. */
  fallback: ReactNode;
  /** Server-side data-saver signal (Save-Data header or the learner's setting). */
  lessData: boolean;
  /** Accessible name of the 3D view. */
  label: string;
  onSelect?: (code: string) => void;
  className?: string;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Career Compass (L-HM-1): a react-three-fiber scene with one glowing node per world, sized and
 * lit by the learner's interest score; tap a node to open the world. Poster-first: the SVG
 * renders on the server and stays unless the device can and may run 3D.
 */
export function CareerCompass3D(props: CareerCompass3DProps) {
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [reduced, setReduced] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const { lessData } = props;

  useEffect(() => {
    if (lessData || browserSavesData() || !hasWebGL()) return;
    // Client-only capability checks decide the mode after hydration (server always renders 2D).
    setReduced(prefersReducedMotion());
    setMode("3d");
  }, [lessData]);

  return (
    <div
      ref={box}
      data-testid="career-compass"
      data-mode={mode}
      className={"relative w-full " + (props.className ?? "")}
    >
      {mode === "3d" ? (
        <Suspense fallback={props.fallback}>
          <div className="aspect-square w-full">
            <CompassScene
              worlds={props.worlds}
              label={props.label}
              reducedMotion={reduced}
              onSelect={props.onSelect}
              onFps={(fps) => box.current?.setAttribute("data-fps", String(fps))}
            />
          </div>
        </Suspense>
      ) : (
        props.fallback
      )}
    </div>
  );
}
