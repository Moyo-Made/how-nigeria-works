import { Suspense, useCallback, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import ChamberRig from "../three/ChamberRig.jsx";
import { ChamberContext } from "../three/chamberContext.js";
import ChamberSitting from "../three/ChamberSitting.jsx";
import { getInterior } from "../three/chamberRegistry.js";
import { getChamber } from "../data/chambers.js";
import { getInstitution } from "../data/institutions.js";
import { toInstitution } from "../hooks/useHashRoute.js";
import SittingPlayer from "./SittingPlayer.jsx";
import sittingStages from "../data/chamberSitting.json";

// Same shape as the specimen's animation table: the field is on the data, so a
// second chamber can carry a different sequence without this file learning its
// name.
const ANIMATIONS = { sitting: sittingStages };

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
  const stages = ANIMATIONS[chamber?.animation] ?? null;

  const [stage, setStage] = useState(null);
  const [playing, setPlaying] = useState(false);
  const sitting = stage !== null;

  // Changing room ends whatever the last one was in the middle of.
  useEffect(() => {
    setStage(null);
    setPlaying(false);
  }, [id]);

  const exit = useCallback(() => {
    setStage(null);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!sitting) return;
    const onKey = (e) => e.key === "Escape" && exit();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sitting, exit]);

  if (!interior) return <NoRoom chamber={chamber} id={id} />;

  const { Component, plan, palette, eye, look, fov, reach, minReach, halfSweep, maxPolar } =
    interior;
  const { radius, height, floorSeats, gallerySeats, seats, ground } = interior;

  const current = sitting ? stages[stage] : null;
  const clamp = (i) => Math.max(0, Math.min(stages.length - 1, i));
  const step = (next) => {
    setStage(clamp(next));
    setPlaying(false);
  };
  // Relative moves go through the updater: two quick taps on Next both read the
  // same rendered index otherwise, and the second one is lost.
  const nudge = (delta) => {
    setStage((s) => clamp(s + delta));
    setPlaying(false);
  };

  return (
    <div className="stage-col">
      <div className="stage">
        <Canvas
          shadows="percentage"
          dpr={[1, 2]}
          camera={{ position: eye, fov, near: 0.1, far: 120 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={[ground]} />

          {/* The provider sits inside the Canvas so the R3F tree can read it:
              every piece of geometry below asks context which room it is in
              rather than being told by whoever rendered it. */}
          <ChamberContext.Provider value={{ plan, palette }}>
            <ChamberRig dim={current?.highlight === "empty"} />

            <Suspense fallback={null}>
              <Component highlight={current?.highlight ?? null} />
            </Suspense>

            {sitting && (
              <ChamberSitting
                fov={fov}
                stages={stages}
                index={stage}
                playing={playing}
                onAdvance={() => setStage((s) => s + 1)}
              />
            )}
          </ChamberContext.Provider>

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
            // The sequence drives the camera itself; leaving these live would
            // have both writing to it every frame.
            enabled={!sitting}
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

        {sitting ? (
          <SittingPlayer
            stages={stages}
            index={stage}
            playing={playing}
            onStep={step}
            onNudge={nudge}
            onPlayPause={() => setPlaying((p) => !p)}
            onExit={exit}
          />
        ) : (
          <p className="stage-tip">
            {chamber.name} &middot; the {chamber.byColour} &middot; {chamber.summary} &middot; drag
            to look around
          </p>
        )}
      </div>

      {!sitting && (
        <>
          <div className="toolbar">
            <BackOut chamber={chamber} />
            {stages && (
              <>
                <span className="tool-spacer" />
                <button
                  className="cta"
                  onClick={() => {
                    setStage(0);
                    setPlaying(true);
                  }}
                >
                  <span className="cta-play" aria-hidden="true" />
                  Watch a sitting
                </button>
              </>
            )}
          </div>

          {/* Below the controls rather than beside them: it is the caption on the
              specimen, not a tool, and it is the longest line in the app. */}
          <p className="stage-note">
            {chamber.seatsInstalled} seats were installed in this room ({chamber.source}); the model
            holds {seats} &mdash; {floorSeats} on the floor and {gallerySeats} in
            the gallery. That agreement is the only check there is: every dimension of the room is
            derived, not sourced, because no floor plan of it is public. Ceiling {height} m, wall
            radius {radius} m.
          </p>
        </>
      )}
    </div>
  );
}
