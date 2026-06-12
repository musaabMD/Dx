"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/** Total walkers; shown as population. */
const POPULATION = 220;
/** Spiral "circles" count = 7 turns. */
const SPIRAL_TURNS = 7;
/** Spiral outer radius (ground plane) in meters. */
const SPIRAL_OUTER_RADIUS = 6.0;
/** Spiral starts near Kaaba edge (meters). */
const SPIRAL_INNER_RADIUS = 2.3;
/** Number of LUT samples for fast dot interpolation. */
const SPIRAL_SAMPLES = 900;
/** Negative = reverse movement. */
// Very slow so movement is subtle in prototype.
const WALK_SPEED = -0.02;

const DOT_RADIUS = 0.16;
const DOT_Y = 0.11;
const DOT_BOB = 0.01;

function buildSpiralLUT(opts: {
  turns: number;
  innerRadius: number;
  outerRadius: number;
  samples: number;
}): Float32Array {
  const { turns, innerRadius, outerRadius, samples } = opts;
  const lut = new Float32Array(samples * 3);
  const tau = Math.PI * 2;
  for (let s = 0; s < samples; s++) {
    const u = s / (samples - 1); // 0..1
    const theta = u * turns * tau;
    const r = innerRadius + (outerRadius - innerRadius) * u;
    const i = s * 3;
    lut[i + 0] = Math.cos(theta) * r;
    lut[i + 1] = DOT_Y;
    lut[i + 2] = Math.sin(theta) * r;
  }
  return lut;
}

function SpiralGuide({ lut }: { lut: Float32Array }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(lut, 3));
    return geo;
  }, [lut]);

  const lineObj = useMemo(() => {
    const material = new THREE.LineBasicMaterial({
      color: "#c4a060",
      transparent: true,
      opacity: 0.5,
    });
    return new THREE.Line(geometry, material);
  }, [geometry]);

  return (
    <primitive object={lineObj} position={[0, 0.018, 0]} />
  );
}

function SpiralWalkers({
  lut,
  samples,
  population,
}: {
  lut: Float32Array;
  samples: number;
  population: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Evenly distribute walkers along the spiral [0..1).
  const meta = useMemo(() => {
    const arr: { u0: number }[] = [];
    for (let i = 0; i < population; i++) arr.push({ u0: i / population });
    return arr;
  }, [population]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const t = state.clock.elapsedTime;

    for (let i = 0; i < meta.length; i++) {
      const uWrapped = (meta[i].u0 + t * WALK_SPEED) % 1;
      const u = uWrapped < 0 ? uWrapped + 1 : uWrapped;

      const idx = u * (samples - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(i0 + 1, samples - 1);
      const frac = idx - i0;

      const a0 = i0 * 3;
      const a1 = i1 * 3;

      const x = THREE.MathUtils.lerp(lut[a0 + 0], lut[a1 + 0], frac);
      const y =
        THREE.MathUtils.lerp(lut[a0 + 1], lut[a1 + 1], frac) +
        Math.sin(t * 0.9 + i) * DOT_BOB;
      const z = THREE.MathUtils.lerp(lut[a0 + 2], lut[a1 + 2], frac);

      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, population]} castShadow>
      <sphereGeometry args={[DOT_RADIUS, 14, 14]} />
      <meshStandardMaterial
        color="#00a3ff"
        emissive="#00a3ff"
        emissiveIntensity={0.35}
        roughness={0.3}
        metalness={0.0}
      />
    </instancedMesh>
  );
}

function Kaaba() {
  return (
    <group position={[0, 1.3, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 2.6, 2.2]} />
        <meshStandardMaterial
          color="#0b0b0b"
          roughness={0.82}
          metalness={0.08}
          emissive="#0b0b0b"
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[2.28, 0.22, 2.28]} />
        <meshStandardMaterial color="#c9a227" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[1.11, 0.2, 0.3]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.35, 0.45]} />
        <meshStandardMaterial color="#1a1510" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Plaza() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[48, 48]} />
      <meshStandardMaterial color="#e6dcc8" roughness={0.92} />
    </mesh>
  );
}

export default function KaabaScene() {
  const lut = useMemo(
    () =>
      buildSpiralLUT({
        turns: SPIRAL_TURNS,
        innerRadius: SPIRAL_INNER_RADIUS,
        outerRadius: SPIRAL_OUTER_RADIUS,
        samples: SPIRAL_SAMPLES,
      }),
    []
  );

  return (
    <div className="relative h-screen w-full">
      <Canvas shadows camera={{ position: [0, 10, 12], fov: 42 }} gl={{ antialias: true }} dpr={[1, 2]}>
        <color attach="background" args={["#cfe0f2"]} />
        {/* Keep fog off for prototype visibility */}
        {/* <fog attach="fog" args={["#cfe0f2", 28, 55]} /> */}
        <ambientLight intensity={0.75} />
        <directionalLight
          position={[10, 22, 12]}
          intensity={2.0}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={40}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        <Plaza />
        {/* SpiralGuide intentionally removed for a cleaner view */}
        <SpiralWalkers lut={lut} samples={SPIRAL_SAMPLES} population={POPULATION} />
        <Kaaba />
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.35}
          scale={20}
          blur={2}
          far={10}
        />
        <OrbitControls
          enablePan
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI / 2 - 0.08}
          minDistance={5}
          maxDistance={22}
          target={[0, 1.1, 0]}
        />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/40 to-transparent px-6 py-6 text-white">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">
          Prototype
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Al-Masjid al-Haram / Kaaba</h1>
        <p className="mt-1 max-w-md text-sm text-white/80">
          Spiral path (outer radius 6m) and moving population — drag to orbit, scroll to zoom.
        </p>
      </div>
      <div className="pointer-events-none absolute bottom-6 left-6 z-10 rounded-lg border border-white/20 bg-black/55 px-4 py-3 text-white shadow-lg backdrop-blur-sm">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm tabular-nums">
          <dt className="text-white/65">Circles</dt>
          <dd className="font-semibold">{SPIRAL_TURNS}</dd>
          <dt className="text-white/65">Population</dt>
          <dd className="font-semibold">{POPULATION}</dd>
        </dl>
        <p className="mt-2 text-xs text-white/55">
          Population equals the number of moving dots (walkers along the spiral).
        </p>
      </div>
    </div>
  );
}
