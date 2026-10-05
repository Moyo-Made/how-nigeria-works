import { doors } from "./chamberDoors.js";
import { useChamber } from "./chamberContext.js";

// The specimen rig lights an object standing in a dark studio. An interior is
// the opposite problem: the room is the subject, the camera is inside it, and
// the light has to come from the ceiling the way the real one does. Nothing here
// is loaded from a CDN, same as the studio rig, so the chamber renders straight
// away on a slow connection.
// `dim` is the committee stage: the chamber has risen and the work has gone to a
// room nobody can watch. Everything is scaled from one number rather than a
// second set of values, so the lit room stays the definition of the room.
// The radius these values were tuned at. A room is lit to the same level however
// big it is — a chamber you cannot read a paper in is not a chamber — so a
// larger one gets more light rather than the same light spread thinner over it.
// Fixtures scale with the circumference they sit on and each one with the throw
// it has to make, which together hold illuminance roughly constant as the floor
// area grows with the square of the radius.
const TUNED_AT = 12.8;

export default function ChamberRig({ dim = false }) {
  const { plan } = useChamber();
  const { WALL_H, WALL_R, DAIS_WALL_Z } = plan;
  const door = doors(plan);
  const level = dim ? 0.3 : 1;
  const k = WALL_R / TUNED_AT;
  const lamps = Math.round(6 * k);
  const ring = Array.from({ length: lamps }, (_, i) => {
    const angle = (i / lamps) * Math.PI * 2;
    return [Math.sin(angle) * WALL_R * 0.55, WALL_H - 1.2, Math.cos(angle) * WALL_R * 0.55];
  });

  return (
    <>
      {/* Warm bounce off oak and red carpet fills a real chamber from below as
          much as the ceiling lights it from above. */}
      <hemisphereLight args={["#fff2e0", "#5a2820", 0.26 * level]} />
      <ambientLight intensity={0.09 * level} />

      {/* The key sits over the floor of the House and points at the dais, which
          is where the room's attention goes and where the modelling is best
          sourced. */}
      <spotLight
        position={[0, WALL_H - 0.8, 5.5 * k]}
        target-position={[0, 1.6, 0]}
        angle={0.8}
        penumbra={0.7}
        intensity={120 * k * k * level}
        distance={30 * k}
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
          intensity={26 * k * level}
          distance={30 * k}
          decay={2}
          color="#ffeeda"
        />
      ))}
      <pointLight position={[0, 3.2 * k, 7.5 * k]} intensity={16 * k * k * level} distance={24 * k} decay={2} color="#ffe9d2" />

      {/* A cool sliver from the flanking doorways, so the dais wall does not
          read as a single flat wash of warm light. Stood at the doors and not
          scaled with the room: a doorway is the same size in either chamber,
          and a light sized for the room and placed by its radius ends up a
          metre off the fluting, burning a hole in it. */}
      {[-1, 1].map((dir) => (
        <pointLight
          key={dir}
          position={[dir * door.x, door.base + 2.2, DAIS_WALL_Z + 2.2]}
          intensity={6 * level}
          distance={9}
          color="#cfe0ff"
        />
      ))}
    </>
  );
}
