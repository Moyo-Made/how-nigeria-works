import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const DURATION = 0.9;
const DROP = 0.55;

const reduced = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// The specimen is set down onto its plinth rather than appearing on it. Keyed
// off the institution so each one gets the gesture, not just the first mount.
export default function Entrance({ id, children }) {
  const group = useRef();
  const t = useRef(0);

  useEffect(() => {
    t.current = reduced() ? DURATION : 0;
  }, [id]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g || t.current >= DURATION) return;

    t.current = Math.min(DURATION, t.current + delta);
    const p = t.current / DURATION;
    // Cubic ease-out: fast arrival, long settle — a hand lowering a specimen
    // rather than an object dropping.
    const eased = 1 - Math.pow(1 - p, 3);

    g.position.y = -DROP * (1 - eased);
    g.scale.setScalar(THREE.MathUtils.lerp(0.86, 1, eased));
  });

  return <group ref={group}>{children}</group>;
}
