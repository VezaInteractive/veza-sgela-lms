"use client";

import {
  Suspense,
  useEffect,
  useImperativeHandle,
  useRef,
  type ComponentRef,
  type Ref,
} from "react";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";

export interface ModelSceneHandle {
  reset(): void;
}

function Model({ url, onReady }: { url: string; onReady: () => void }) {
  // Draco off: seed GLBs are uncompressed; the M3 pipeline decides on Meshopt/Draco (PRD 13.5).
  const { scene } = useGLTF(url, false);
  useEffect(() => {
    onReady();
  }, [onReady]);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

/**
 * The live part of ModelViewer3D, loaded on demand. Renders only when something changes
 * (frameloop "demand"), so an idle model costs no battery.
 */
export default function ModelScene({
  url,
  label,
  onReady,
  ref,
}: {
  url: string;
  label: string;
  onReady: () => void;
  ref?: Ref<ModelSceneHandle>;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  useImperativeHandle(ref, () => ({ reset: () => controls.current?.reset() }), []);
  return (
    <Canvas
      role="img"
      aria-label={label}
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [3.4, 2.4, 4.4], fov: 40 }}
      style={{ position: "absolute", inset: 0, touchAction: "none" }}
    >
      <color attach="background" args={["#0B0F14"]} />
      <hemisphereLight args={["#ffffff", "#2a3340", 1.4]} />
      <directionalLight position={[4, 6, 3]} intensity={2.2} />
      <directionalLight position={[-5, 2, -4]} intensity={0.6} color="#ABCF37" />
      <Suspense fallback={null}>
        <Model url={url} onReady={onReady} />
      </Suspense>
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping={false}
        minDistance={2}
        maxDistance={12}
      />
    </Canvas>
  );
}
