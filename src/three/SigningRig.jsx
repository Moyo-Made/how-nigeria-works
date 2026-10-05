import { useChamber } from "./chamberContext.js";

// The signing room's light: a row of downlights washing the timber wall behind
// the chair, which is the brightest thing in every photograph of the room, and
// a soft fill for the desk in front of it.
export default function SigningRig({ dim = false }) {
  const { WALL_H, BACK_Z, HALF_W } = useChamber().plan;
  const level = dim ? 0.3 : 1;
  const wash = [-0.8, -0.48, -0.16, 0.16, 0.48, 0.8].map((t) => t * HALF_W);

  return (
    <>
      <hemisphereLight args={["#fff1e2", "#3a2019", 0.34 * level]} />
      <ambientLight intensity={0.12 * level} />

      <spotLight
        position={[0, WALL_H - 0.2, 1.2]}
        target-position={[0, 0.9, -1.6]}
        angle={0.9}
        penumbra={0.7}
        intensity={46 * level}
        distance={12}
        color="#fff4e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.06}
      />

      {wash.map((x) => (
        <pointLight
          key={x}
          position={[x, WALL_H - 0.45, BACK_Z + 0.55]}
          intensity={2.2 * level}
          distance={4.5}
          color="#ffe6cc"
        />
      ))}

      <pointLight position={[0, 2.6, 2.6]} intensity={16 * level} distance={10} color="#fff1e0" />
    </>
  );
}
