import { useChamber } from "./chamberContext.js";

// The Council Chamber's light. The room is lit from one place: a great lit oval
// in the ceiling over the table, with the timber round it left dark and picked
// out only by a strip of lit stone on each column. So the middle of the room is
// bright and its edges fall away, which every photograph of it shows.
export default function CouncilRig({ dim = false }) {
  const { WALL_H, HALF_L, TABLE_Z, columns } = useChamber().plan;
  const level = dim ? 0.3 : 1;

  return (
    <>
      <hemisphereLight args={["#f4f8ee", "#3a2019", 0.3 * level]} />
      <ambientLight intensity={0.1 * level} />

      {/* The key is on the head of the table. */}
      <spotLight
        position={[0, WALL_H - 0.3, 1]}
        target-position={[0, 0.9, -TABLE_Z]}
        angle={0.95}
        penumbra={0.7}
        intensity={110 * level}
        distance={24}
        color="#fff6ea"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.09}
      />

      {/* The oval itself, as five lamps along its length. */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((t) => (
        <pointLight
          key={t}
          position={[0, WALL_H - 0.7, t * TABLE_Z]}
          intensity={26 * level}
          distance={16}
          decay={2}
          color="#f6faef"
        />
      ))}

      {/* A wash at the wall behind the chair, which is white and should read
          as white. */}
      <pointLight position={[0, 2.6, -HALF_L + 2.2]} intensity={14 * level} distance={8} color="#ffffff" />

      {/* The glow each column throws on the timber beside it. */}
      {columns().map(({ x, z }) => (
        <pointLight
          key={`${x}:${z}`}
          position={[x * 0.93, 2.2, z * 0.93]}
          intensity={3.5 * level}
          distance={5}
          color="#ffd9c4"
        />
      ))}
    </>
  );
}
