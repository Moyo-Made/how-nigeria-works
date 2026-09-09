import { WALL_H, WALL_R } from "./chamberPlan.js";

// The specimen rig lights an object standing in a dark studio. An interior is
// the opposite problem: the room is the subject, the camera is inside it, and
// the light has to come from the ceiling the way the real one does. Nothing here
// is loaded from a CDN, same as the studio rig, so the chamber renders straight
// away on a slow connection.
// `dim` is the committee stage: the chamber has risen and the work has gone to a
// room nobody can watch. Everything is scaled from one number rather than a
// second set of values, so the lit room stays the definition of the room.
export default function ChamberRig({ dim = false }) {
  const level = dim ? 0.3 : 1;
  const ring = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2;
    return [Math.sin(angle) * WALL_R * 0.55, WALL_H - 1.2, Math.cos(angle) * WALL_R * 0.55];
  });

  return (
    <>
      {/* Warm bounce off oak and red carpet fills a real chamber from below as
          much as the ceiling lights it from above. */}
      <hemisphereLight args={["#fff2e0", "#5a2820", 0.4 * level]} />
      <ambientLight intensity={0.16 * level} />

      {/* The key sits over the floor of the House and points at the dais, which
          is where the room's attention goes and where the modelling is best
          sourced. */}
      <spotLight
        position={[0, WALL_H - 0.8, 5.5]}
        target-position={[0, 1.6, 0]}
        angle={0.8}
        penumbra={0.7}
        intensity={220 * level}
        distance={30}
        color="#fff4e4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        // The curved baize and the cylinder arcs it sits on are gently sloped
        // surfaces facing the light, which is exactly the case plain depth bias
        // handles badly — without a normal bias they band.
        shadow-bias={-0.0002}
        shadow-normalBias={0.09}
      />

      {/* A real chamber is lit evenly enough to read a paper anywhere in it, so
          the ring carries far more of the load than a studio key would: with the
          spot alone the far side of the room falls away to black. */}
      {ring.map(([x, y, z]) => (
        <pointLight
          key={`${x}:${z}`}
          position={[x, y, z]}
          intensity={58 * level}
          distance={30}
          decay={1.8}
          color="#ffeeda"
        />
      ))}
      <pointLight position={[0, 3.2, 7.5]} intensity={34 * level} distance={24} decay={1.8} color="#ffe9d2" />

      {/* A cool sliver from the flanking doorways, so the dais wall does not
          read as a single flat wash of warm light. */}
      <pointLight position={[-8.4, 2.2, 0.4]} intensity={14 * level} distance={9} color="#cfe0ff" />
      <pointLight position={[8.4, 2.2, 0.4]} intensity={14 * level} distance={9} color="#cfe0ff" />
    </>
  );
}
