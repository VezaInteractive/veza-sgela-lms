"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  CareerCompass3D,
  ModelViewer3D,
  type CompassWorld,
  type ModelViewer3DProps,
} from "@sgela/three";
import { track } from "@/lib/analytics/client";

/** ModelViewer3D with analytics (M2-2). three.js loads only after the learner taps the size gate. */
export function ExploreModelViewer(props: Omit<ModelViewer3DProps, "onEvent">) {
  return <ModelViewer3D {...props} onEvent={(name) => track(name, { model: props.glbUrl })} />;
}

/** Home Career Compass (L-HM-1): 3D when the device can, the server-rendered SVG otherwise. */
export function HomeCompass({
  worlds,
  fallback,
  lessData,
  label,
}: {
  worlds: CompassWorld[];
  fallback: ReactNode;
  lessData: boolean;
  label: string;
}) {
  const router = useRouter();
  return (
    <CareerCompass3D
      worlds={worlds}
      fallback={fallback}
      lessData={lessData}
      label={label}
      onSelect={(code) => {
        track("compass_world_opened", { world: code, mode: "3d" });
        router.push("/explore/" + code.toLowerCase());
      }}
    />
  );
}
