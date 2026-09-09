import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import ChamberRig from "../three/ChamberRig.jsx";
import { getInterior } from "../three/chamberRegistry.js";
import { getChamber } from "../data/chambers.js";
import { getInstitution } from "../data/institutions.js";
import { toInstitution } from "../hooks/useHashRoute.js";

// A room is entered from a building, so it is always left back into one. Without
// this the only way out of the chamber is to pick some other institution off the
// rail, which loses the thing you were looking at to get here.
function BackOut({ chamber }) {
  const institution = getInstitution(chamber?.institution);
  if (!institution) return null;

  return (
    <div className="tool-group">
      <button className="tool" onClick={() => toInstitution(institution.id)}>
        &larr; Back to the {institution.name}
      </button>
    </div>
  );
}

// Two ways to arrive here without a room: a chamber the app knows about but has
// not modelled, and a hash someone typed. Both are dead ends, so both say what
// went wrong and both offer the way back rather than stranding the reader in an
// empty stage.
function NoRoom({ chamber, id }) {
  return (
    <div className="stage-col">
      <div className="stage">
        <div className="soon">
          <div>
            <p className="eyebrow">{chamber ? "Not built yet" : "No such room"}</p>
            <h2>{chamber ? chamber.name : id}</h2>
            <p>{chamber ? chamber.note : "This app does not model a room by that name."}</p>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <BackOut chamber={chamber ?? { institution: "national-assembly" }} />
      </div>
    </div>
  );
}

export default function ChamberView({ id }) {
  const chamber = getChamber(id);
  const interior = chamber?.status === "complete" ? getInterior(id) : null;

  if (!interior) return <NoRoom chamber={chamber} id={id} />;

  const { Component, eye, look, reach, minReach, halfSweep, maxPolar } = interior;
  const { radius, height, floorSeats, gallerySeats, ground } = interior;

  return (
    <div className="stage-col">
      <div className="stage">
        <Canvas
          shadows="percentage"
          dpr={[1, 2]}
          camera={{ position: eye, fov: 58, near: 0.1, far: 120 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={[ground]} />
          <ChamberRig />

          <Suspense fallback={null}>
            <Component />
          </Suspense>

          {/* The eye is fenced into the part of the room that was built. Every
              limit comes off the room's own plan rather than being tuned here —
              see the note on the camera fence in chamberPlan. Sweep is as wide
              as the room has: it stops where the eye would pass behind the dais
              wall, because what is back there is a dead crescent nobody has ever
              stood in. Reach is clamped because everything here is drawn to be
              seen from inside, and a camera that leaves the shell sees the back
              of all of it. */}
          <OrbitControls
            makeDefault
            target={look}
            enablePan={false}
            minDistance={minReach}
            maxDistance={reach}
            minAzimuthAngle={-halfSweep}
            maxAzimuthAngle={halfSweep}
            minPolarAngle={0.35}
            maxPolarAngle={maxPolar}
            enableDamping
            dampingFactor={0.06}
          />
        </Canvas>

        <p className="stage-tip">
          {chamber.name} &middot; the {chamber.byColour} &middot; {chamber.summary} &middot; drag to
          look around
        </p>
      </div>

      <div className="toolbar">
        <BackOut chamber={chamber} />
      </div>

      {/* Below the controls rather than beside them: it is the caption on the
          specimen, not a tool, and it is the longest line in the app. */}
      <p className="stage-note">
        {chamber.seatsInstalled} seats were installed in this room ({chamber.source}); the model
        holds {floorSeats + gallerySeats} &mdash; {floorSeats} on the floor and {gallerySeats} in
        the gallery. That agreement is the only check there is: every dimension of the room is
        derived, not sourced, because no floor plan of it is public. Ceiling {height} m, wall
        radius {radius} m.
      </p>
    </div>
  );
}
