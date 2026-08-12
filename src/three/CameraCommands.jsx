import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const spherical = new THREE.Spherical();
const offset = new THREE.Vector3();

// OrbitControls can jump to an angle but cannot animate to one, so the buttons
// bank a delta here and each frame consumes a slice of it. The specimen turns
// instead of teleporting, and repeated taps accumulate rather than fight.
export default function CameraCommands({ pending }) {
  const controls = useThree((s) => s.controls);
  const camera = useThree((s) => s.camera);

  useFrame((_, delta) => {
    const p = pending.current;
    if (!controls || (!p.azimuth && !p.dolly)) return;

    const k = Math.min(1, delta * 7);
    const dTheta = p.azimuth * k;
    // Dolly is banked in log space so consuming it linearly stays exact
    // however many steps are queued.
    const dDolly = p.dolly * k;

    offset.copy(camera.position).sub(controls.target);
    spherical.setFromVector3(offset);
    spherical.theta += dTheta;
    spherical.radius = THREE.MathUtils.clamp(
      spherical.radius * Math.exp(dDolly),
      controls.minDistance,
      controls.maxDistance
    );
    camera.position.copy(offset.setFromSpherical(spherical).add(controls.target));
    controls.update();

    p.azimuth = Math.abs(p.azimuth - dTheta) < 1e-4 ? 0 : p.azimuth - dTheta;
    p.dolly = Math.abs(p.dolly - dDolly) < 1e-4 ? 0 : p.dolly - dDolly;
  });

  return null;
}
