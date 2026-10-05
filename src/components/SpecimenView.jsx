import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import SceneRig from "../three/SceneRig.jsx";
import Plinth from "../three/Plinth.jsx";
import ExplodedModel from "../three/ExplodedModel.jsx";
import Entrance from "../three/Entrance.jsx";
import CameraCommands from "../three/CameraCommands.jsx";
import Hotspots from "../three/Hotspots.jsx";
import BillAnimation from "../three/BillAnimation.jsx";
import ContentPanel from "./ContentPanel.jsx";
import StageControls from "./StageControls.jsx";
import BillPlayer from "./BillPlayer.jsx";
import billStages from "../data/billToLaw.json";

const STEP_AZIMUTH = Math.PI / 6;
const STEP_DOLLY = Math.log(1.3);

const IDLE = { autoRotate: false, isolate: false, exploded: false };

// The only animation in v1; the field is on the data so more can follow.
const ANIMATIONS = { "bill-to-law": billStages };

export default function SpecimenView({ institution, playRequest, onPlayAnimation }) {
  const { id, hotspots = [], animation } = institution;
  const [view, setView] = useState(IDLE);
  const [openId, setOpenId] = useState(null);
  const [canExplode, setCanExplode] = useState(false);
  const [stage, setStage] = useState(null);
  const [playing, setPlaying] = useState(false);

  const stages = ANIMATIONS[animation] ?? null;
  const animating = stage !== null;

  const model = useRef();
  const controls = useRef();
  const pending = useRef({ azimuth: 0, dolly: 0 });

  const { autoRotate, isolate, exploded } = view;
  const close = useCallback(() => setOpenId(null), []);

  // The Canvas persists across institutions, so the camera would otherwise
  // arrive at the next specimen wherever the last one was left.
  useEffect(() => {
    controls.current?.reset();
    pending.current = { azimuth: 0, dolly: 0 };
    setView(IDLE);
    setOpenId(null);
    setStage(null);
    setPlaying(false);
  }, [id]);

  // The toolbar and the card below the well both ask for the animation by
  // bumping a counter, so either can start it without owning its state.
  useEffect(() => {
    if (!playRequest || !stages) return;
    setView(IDLE);
    setOpenId(null);
    setStage(0);
    setPlaying(true);
  }, [playRequest, stages]);

  const exit = useCallback(() => {
    setStage(null);
    setPlaying(false);
    // The animation drove the camera directly, so hand it back where it started.
    controls.current?.reset();
    pending.current = { azimuth: 0, dolly: 0 };
  }, []);

  useEffect(() => {
    if (!openId && !animating) return;
    const onKey = (e) => e.key === "Escape" && (animating ? exit() : close());
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, animating, close, exit]);

  const open = (hotspotId) => {
    setOpenId(hotspotId);
    setView((v) => ({ ...v, autoRotate: false }));
  };

  const toggle = (key) => {
    const turningOn = !view[key];
    setView((v) => ({
      ...v,
      [key]: turningOn,
      ...(key === "exploded" && turningOn ? { autoRotate: false } : null),
    }));
    // Isolate and Break open both strip the markers, so an open card would be
    // left describing something no longer on screen.
    if (turningOn && (key === "isolate" || key === "exploded")) setOpenId(null);
    // Separating the parts needs more room than the assembled building.
    if (key === "exploded") pending.current.dolly += turningOn ? STEP_DOLLY : -STEP_DOLLY;
  };

  const reset = () => {
    controls.current?.reset();
    pending.current = { azimuth: 0, dolly: 0 };
    setView(IDLE);
    setOpenId(null);
  };

  const clamp = (i) => Math.max(0, Math.min(stages.length - 1, i));
  const step = (next) => {
    setStage(clamp(next));
    setPlaying(false);
  };
  // Relative moves go through the updater: two quick taps on Next both read the
  // same rendered index otherwise, and the second one is lost.
  const nudgeStage = (delta) => {
    setStage((s) => clamp(s + delta));
    setPlaying(false);
  };

  const annotated = !isolate && !exploded && !animating;

  return (
    <>
      <div className="stage-col">
        <div className="stage">
          <Canvas
            shadows="percentage"
            dpr={[1, 2]}
            camera={{ position: [0.9, 0.95, 5.2], fov: 38 }}
            gl={{ antialias: true }}
            onPointerMissed={close}
          >
            <color attach="background" args={["#07180f"]} />
            <fog attach="fog" args={["#07180f", 9, 24]} />
            <SceneRig />

            <group position={[0, -0.6, 0]}>
              {!isolate && <Plinth radius={1.7} />}

              <Entrance id={id}>
                <ExplodedModel
                  id={id}
                  exploded={exploded}
                  onStructure={setCanExplode}
                  groupRef={model}
                />
              </Entrance>

              {annotated && (
                <Hotspots
                  items={hotspots}
                  openId={openId}
                  occludes={model}
                  onOpen={open}
                  onClose={close}
                />
              )}

              {animating && (
                <BillAnimation
                  stages={stages}
                  index={stage}
                  playing={playing}
                  onAdvance={() => setStage((s) => s + 1)}
                />
              )}

              {!isolate && (
                <ContactShadows
                  position={[0, 0.002, 0]}
                  opacity={0.45}
                  scale={6}
                  blur={2.4}
                  far={4}
                />
              )}
            </group>

            <OrbitControls
              ref={controls}
              makeDefault
              // The animation drives the camera itself; leaving the controls live
              // would have both writing to it every frame.
              enabled={!animating}
              enablePan={false}
              target={[0, -0.15, 0]}
              minDistance={2.6}
              maxDistance={10}
              minPolarAngle={0.2}
              maxPolarAngle={Math.PI / 2.05}
              enableDamping
              dampingFactor={0.06}
              autoRotate={autoRotate && !animating}
              autoRotateSpeed={1.4}
            />
            <CameraCommands pending={pending} />
          </Canvas>

          {animating ? (
            <BillPlayer
              stages={stages}
              index={stage}
              playing={playing}
              onStep={step}
              onNudge={nudgeStage}
              onPlayPause={() => setPlaying((p) => !p)}
              onExit={exit}
            />
          ) : (
            <p className="stage-tip">
              {exploded
                ? "Separated into its parts"
                : "Drag to rotate · Scroll to zoom · Tap a name to read about it"}
            </p>
          )}
        </div>

        {!animating && (
          <StageControls
            autoRotate={autoRotate}
            isolate={isolate}
            exploded={exploded}
            canExplode={canExplode}
            hasAnimation={Boolean(stages)}
            onRotate={(dir) => (pending.current.azimuth += dir * STEP_AZIMUTH)}
            onZoom={(dir) => (pending.current.dolly -= dir * STEP_DOLLY)}
            onToggle={toggle}
            onReset={reset}
            onPlayAnimation={onPlayAnimation}
          />
        )}
      </div>

      <ContentPanel institution={institution} />
    </>
  );
}
