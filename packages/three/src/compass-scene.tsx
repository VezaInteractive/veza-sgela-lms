"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { CompassWorld } from "./compass";
import { compassLayout } from "./util";

const LIME = "#ABCF37";

/** Reports frames per second once a second (read by e2e as data-fps on the Compass). */
function FpsMeter({ onFps }: { onFps?: (fps: number) => void }) {
  const frames = useRef(0);
  const since = useRef(0);
  useFrame((state) => {
    frames.current += 1;
    const t = state.clock.elapsedTime;
    if (t - since.current >= 1) {
      onFps?.(Math.round(frames.current / (t - since.current)));
      frames.current = 0;
      since.current = t;
    }
  });
  return null;
}

interface NodeProps {
  world: CompassWorld;
  x: number;
  z: number;
  radius: number;
  height: number;
  glow: number;
  onSelect?: (code: string) => void;
}

function Node({ world, x, z, radius, height, glow, onSelect }: NodeProps) {
  const [hover, setHover] = useState(false);
  const s = hover ? 1.18 : 1;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, height, 8]} />
        <meshLambertMaterial color={world.color} transparent opacity={0.55} />
      </mesh>
      <mesh
        position={[0, height + radius * 0.6, 0]}
        scale={[s, s, s]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(world.code);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[radius, 24, 16]} />
        <meshLambertMaterial color={world.color} emissive={world.color} emissiveIntensity={glow} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[radius * 0.9, radius * 1.25, 32]} />
        <meshBasicMaterial color={world.color} transparent opacity={0.25 + 0.5 * glow} />
      </mesh>
    </group>
  );
}

interface SceneProps {
  worlds: CompassWorld[];
  reducedMotion: boolean;
  onSelect?: (code: string) => void;
  onFps?: (fps: number) => void;
}

function Scene({ worlds, reducedMotion, onSelect, onFps }: SceneProps) {
  const group = useRef<Group>(null);
  const core = useRef<Group>(null);
  const layout = useMemo(() => compassLayout(worlds), [worlds]);
  useFrame((state, delta) => {
    if (reducedMotion) return;
    if (group.current) group.current.rotation.y += delta * 0.12;
    if (core.current) {
      core.current.position.y = 0.45 + Math.sin(state.clock.elapsedTime * 1.6) * 0.06;
    }
  });
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 6, 4]} intensity={1.6} />
      <group ref={group}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3, 48]} />
          <meshBasicMaterial color={LIME} transparent opacity={0.08} />
        </mesh>
        {[1, 1.6, 2.2, 2.8].map((r) => (
          <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <ringGeometry args={[r - 0.012, r + 0.012, 64]} />
            <meshBasicMaterial color={LIME} transparent opacity={0.35} />
          </mesh>
        ))}
        {layout.map((n) => (
          <mesh
            key={"spoke-" + n.code}
            position={[n.x / 2, 0.02, n.z / 2]}
            rotation={[0, -Math.atan2(n.z, n.x), 0]}
          >
            <boxGeometry args={[Math.hypot(n.x, n.z), 0.012, 0.03]} />
            <meshBasicMaterial color={LIME} transparent opacity={0.45} />
          </mesh>
        ))}
        {layout.map((n, i) => (
          <Node key={n.code} world={worlds[i]!} {...n} onSelect={onSelect} />
        ))}
        <group ref={core} position={[0, 0.45, 0]}>
          <mesh>
            <icosahedronGeometry args={[0.32, 1]} />
            <meshLambertMaterial color={LIME} emissive={LIME} emissiveIntensity={0.6} />
          </mesh>
        </group>
      </group>
      <FpsMeter onFps={onFps} />
    </>
  );
}

/**
 * The live 3D Compass (loaded on demand). Kept light for low-end phones: about 25 small meshes,
 * Lambert materials, no shadows or post-processing, pixel ratio capped at 1.5. Under reduced
 * motion it renders a still frame (frameloop "demand").
 */
export default function CompassScene({
  worlds,
  label,
  reducedMotion,
  onSelect,
  onFps,
}: SceneProps & { label: string }) {
  return (
    <Canvas
      role="img"
      aria-label={label}
      dpr={[1, 1.5]}
      frameloop={reducedMotion ? "demand" : "always"}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      camera={{ position: [0, 4.4, 5.4], fov: 42 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.4, 0)}
      style={{ touchAction: "pan-y" }}
    >
      <Scene worlds={worlds} reducedMotion={reducedMotion} onSelect={onSelect} onFps={onFps} />
    </Canvas>
  );
}
