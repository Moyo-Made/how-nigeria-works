import { useChamber } from "./chamberContext.js";

// The courtroom's light. Same job as the chambers' rig — the room is the
// subject and the light comes from its ceiling — but a different room: a long
// rectangular hall lit by two runs of ceiling panels, with a balcony round
// three sides that puts everything under it in shade.
//
// `dim` is the court having risen: the Justices are out of the room and the
// decision is being made somewhere nobody can watch.
export default function CourtRig({ dim = false }) {
  const { WALL_H, HALF_W, FRONT_Z, REAR_Z, GALLERY_Y } = useChamber().plan;
  const level = dim ? 0.3 : 1;
  const depth = REAR_Z - FRONT_Z;
  const runs = [0.14, 0.38, 0.62, 0.86].map((t) => FRONT_Z + t * depth);

  return (
    <>
      {/* Golden timber and a dark red carpet throw a warm light back up. */}
      <hemisphereLight args={["#fff3e2", "#4a2a22", 0.26 * level]} />
      <ambientLight intensity={0.08 * level} />

      {/* The key falls on the bench from over the well, which is where the room
          looks and where the modelling is best sourced. */}
      <spotLight
        position={[0, WALL_H - 0.5, 4]}
        target-position={[0, 1.6, -5]}
        angle={0.95}
        penumbra={0.7}
        intensity={170 * level}
        distance={34}
        color="#fff4e4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.09}
      />

      {/* One lamp under each run of ceiling panels, at the same stations down
          the room, so the hall is lit evenly from end to end. */}
      {[-1, 1].map((dir) =>
        runs.map((z) => (
          <pointLight
            key={`${dir}:${z}`}
            position={[dir * 6, WALL_H - 0.9, z]}
            intensity={30 * level}
            distance={26}
            decay={2}
            color="#ffeeda"
          />
        ))
      )}

      {/* Under the side galleries, which the ceiling cannot reach. */}
      {[-1, 1].map((dir) =>
        [2, 11].map((z) => (
          <pointLight
            key={`${dir}:${z}`}
            position={[dir * (HALF_W - 1.5), GALLERY_Y - 0.7, z]}
            intensity={7 * level}
            distance={8}
            color="#ffe2b8"
          />
        ))
      )}
    </>
  );
}
