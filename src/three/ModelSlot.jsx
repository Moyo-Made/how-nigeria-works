import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { getPrimitive, modelUrl, preloadPrimitive, probeGlb } from "./registry.js";

// GLTFLoader and its Draco/meshopt machinery are a large fraction of the 3D
// bundle. Held behind lazy() they are fetched only once a probe has found a real
// GLB, so until the pipeline delivers one nobody pays for a loader that has
// nothing to load.
const GlbModel = lazy(() => import("./GlbModel.jsx"));

function GhostMass() {
  const ref = useRef();

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.35;
    ref.current.children[0].material.opacity =
      0.08 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
  });

  return (
    <group ref={ref} position={[0, 0.55, 0]}>
      <mesh>
        <boxGeometry args={[1.15, 1.05, 0.9]} />
        <meshBasicMaterial color="#6fdca8" wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

export default function ModelSlot({ id }) {
  const { Component, scale } = getPrimitive(id);
  const [hasGlb, setHasGlb] = useState(null);

  useEffect(() => {
    let live = true;
    // Probe and chunk download race in parallel, so checking for a GLB costs
    // nothing when there isn't one.
    preloadPrimitive(id);
    probeGlb(id).then((found) => live && setHasGlb(found));
    return () => {
      live = false;
    };
  }, [id]);

  if (hasGlb === null) return <GhostMass />;

  return (
    <Suspense fallback={<GhostMass />}>
      {hasGlb ? <GlbModel url={modelUrl(id)} /> : <Component scale={scale} />}
    </Suspense>
  );
}
