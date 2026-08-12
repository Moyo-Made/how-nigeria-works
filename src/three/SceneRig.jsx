import * as THREE from "three";
import StudioEnvironment from "./StudioEnvironment.jsx";

// A light panel: the emissive plane a reflective surface sees. Intensity is
// folded into the colour because the bake reads the material colour directly.
function Panel({ color, intensity, ...props }) {
  return (
    <mesh {...props}>
      <planeGeometry />
      <meshBasicMaterial
        color={new THREE.Color(color).multiplyScalar(intensity)}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

// Lighting is fully local — no CDN HDRI — so the scene renders instantly on a
// slow connection. The panels stand in for studio reflections.
export default function SceneRig() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <hemisphereLight args={["#cfe8dc", "#04120c", 0.55]} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      >
        <orthographicCamera attach="shadow-camera" args={[-6, 6, 6, -6, 0.1, 30]} />
      </directionalLight>
      <directionalLight position={[-5, 2, -2]} intensity={0.7} color="#2fa377" />
      <pointLight position={[0, 1.2, -4]} intensity={12} distance={12} color="#c9a227" />

      <StudioEnvironment resolution={128}>
        <Panel intensity={2.4} position={[0, 4, 2]} scale={[8, 4, 1]} color="#f4f1ea" />
        <Panel intensity={1.2} position={[-4, 1, 1]} scale={[4, 4, 1]} color="#7fd9b0" />
        <Panel intensity={0.9} position={[4, 0.5, -2]} scale={[4, 4, 1]} color="#c9a227" />
        <Panel
          intensity={0.6}
          position={[0, -3, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[10, 10, 1]}
          color="#0b1f17"
        />
      </StudioEnvironment>
    </>
  );
}
