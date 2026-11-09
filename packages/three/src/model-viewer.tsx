"use client";

import { Component, lazy, Suspense, useRef, useState, type ReactNode } from "react";
import { formatBytes, hasWebGL } from "./util";
import type { ModelSceneHandle } from "./model-scene";

/** three.js loads only after the learner taps "View in 3D" (poster-first, PRD 13.3). */
const ModelScene = lazy(() => import("./model-scene"));

export interface ModelViewerLabels {
  /** e.g. "View in 3D"; the file size is appended by the component. */
  load: string;
  loading: string;
  reset: string;
  /** Shown instead of the 3D view when the device has no WebGL. */
  noWebgl: string;
  failed: string;
  /** Accessible name for the 3D canvas, e.g. "3D model: Jet engine. Drag to turn it." */
  canvas: string;
}

export type ModelViewerEvent = "model_viewer_loaded" | "model_viewer_reset" | "model_viewer_failed";

export interface ModelViewer3DProps {
  glbUrl: string;
  posterUrl: string;
  sizeBytes: number;
  /** Alt text for the poster image. */
  alt: string;
  labels: ModelViewerLabels;
  accent?: string;
  className?: string;
  onEvent?: (name: ModelViewerEvent) => void;
}

type Phase = "poster" | "live" | "nowebgl" | "failed";

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch() {
    this.props.onError();
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * ModelViewer3D v1 (M2-2): poster first with a size gate, then an orbitable 3D model with a
 * reset button. Without WebGL the poster stays and a note explains why.
 */
export function ModelViewer3D(props: ModelViewer3DProps) {
  const { labels, accent = "#ABCF37", onEvent } = props;
  const [phase, setPhase] = useState<Phase>("poster");
  const [ready, setReady] = useState(false);
  const scene = useRef<ModelSceneHandle>(null);

  function start() {
    setPhase(hasWebGL() ? "live" : "nowebgl");
  }

  return (
    <div
      data-testid="model-viewer"
      data-phase={phase}
      data-ready={ready ? "true" : "false"}
      className={
        "relative isolate aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#0B0F14] " +
        (props.className ?? "")
      }
    >
      {phase !== "live" || !ready ? (
        <img
          src={props.posterUrl}
          alt={props.alt}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : null}
      {phase === "live" ? (
        <SceneBoundary
          onError={() => {
            setPhase("failed");
            onEvent?.("model_viewer_failed");
          }}
        >
          <Suspense fallback={null}>
            <ModelScene
              ref={scene}
              url={props.glbUrl}
              label={labels.canvas}
              onReady={() => {
                setReady(true);
                onEvent?.("model_viewer_loaded");
              }}
            />
          </Suspense>
        </SceneBoundary>
      ) : null}

      <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2">
        {phase === "poster" ? (
          <button
            type="button"
            onClick={start}
            className="min-h-11 rounded-full px-4 text-sm font-semibold text-[#0B0F14] shadow-lg"
            style={{ background: accent }}
          >
            {labels.load} · {formatBytes(props.sizeBytes)}
          </button>
        ) : null}
        {phase === "live" && !ready ? (
          <span
            role="status"
            className="rounded-full bg-black/75 px-4 py-2 text-sm font-semibold text-white"
          >
            {labels.loading}
          </span>
        ) : null}
        {phase === "live" && ready ? (
          <button
            type="button"
            onClick={() => {
              scene.current?.reset();
              onEvent?.("model_viewer_reset");
            }}
            className="ml-auto min-h-11 rounded-full bg-black/75 px-4 text-sm font-semibold text-white"
          >
            {labels.reset}
          </button>
        ) : null}
        {phase === "nowebgl" || phase === "failed" ? (
          <p
            role="status"
            className="rounded-xl bg-black/75 px-3 py-2 text-sm font-medium text-white"
          >
            {phase === "nowebgl" ? labels.noWebgl : labels.failed}
          </p>
        ) : null}
      </div>
    </div>
  );
}
