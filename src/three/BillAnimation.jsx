import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const wanted = new THREE.Vector3();
const billWorld = new THREE.Vector3();
const spherical = new THREE.Spherical();
const offset = new THREE.Vector3();

const DEFAULT_POLAR = 1.3;
const STAGE_SECONDS = 8;

// The camera aims below the document so it frames clear of the caption card
// along the bottom. How far below depends on how much of the stage the caption
// actually covers: on a landscape stage it is most of the lower third, on a tall
// phone it is a thin strip, and the landscape value there strands the bill in
// the top quarter with dead space beneath it.
const LOOK_BELOW = 0.42;
const lookBelow = ({ width, height }) =>
  LOOK_BELOW * THREE.MathUtils.clamp(width / height, 0.4, 1);

// Per-stage distances were framed against a landscape stage. The fov is
// vertical, so a portrait stage shows proportionally less width and crops these
// buildings, which are far wider than they are tall. Backing off restores the
// width; the ceiling stops a very tall phone pushing the model to a speck.
const DESIGN_ASPECT = 1.3;
const fitScale = ({ width, height }) =>
  THREE.MathUtils.clamp(DESIGN_ASPECT / (width / height), 1, 1.9);

function Document({ innerRef, signed }) {
  const sheet = useRef();

  useFrame((state) => {
    if (!sheet.current) return;
    const t = state.clock.elapsedTime;
    sheet.current.rotation.y = t * 0.5;
    sheet.current.rotation.z = Math.sin(t * 1.2) * 0.07;
    sheet.current.position.y = Math.sin(t * 1.6) * 0.014;
  });

  return (
    <group ref={innerRef}>
      <group ref={sheet}>
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.006, 0.27]} />
          <meshStandardMaterial color="#f6f3ec" roughness={0.85} />
        </mesh>
        {/* the seal: brass while the bill travels, flag green once assented */}
        <mesh position={[0, 0.005, -0.08]}>
          <cylinderGeometry args={[0.03, 0.03, 0.005, 20]} />
          <meshStandardMaterial
            color={signed ? "#008751" : "#c9a227"}
            roughness={0.35}
            metalness={0.7}
            emissive={signed ? "#008751" : "#000000"}
            emissiveIntensity={signed ? 0.5 : 0}
          />
        </mesh>
      </group>
      <pointLight intensity={signed ? 1.1 : 0.55} distance={1.5} color="#f4f1ea" />
    </group>
  );
}

export default function BillAnimation({ stages, index, playing, onAdvance }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const bill = useRef();
  const rig = useRef();
  const orbit = useRef(null);
  const elapsed = useRef(0);

  const stage = stages[index];
  const last = index === stages.length - 1;

  // Restarting the dwell on every stage change is what keeps the caption and
  // the document in step when the viewer steps through by hand.
  useEffect(() => {
    elapsed.current = 0;
  }, [index]);

  useFrame((_, delta) => {
    if (!bill.current || !rig.current) return;

    wanted.set(...stage.bill);
    bill.current.position.lerp(wanted, 1 - Math.exp(-3.2 * delta));
    bill.current.getWorldPosition(billWorld);
    billWorld.y -= lookBelow(size);

    if (!orbit.current) {
      // Start from wherever the viewer left the camera rather than cutting.
      offset.copy(camera.position).sub(billWorld);
      spherical.setFromVector3(offset);
      orbit.current = {
        theta: spherical.theta,
        phi: spherical.phi,
        radius: spherical.radius,
        target: billWorld.clone(),
      };
    }

    const o = orbit.current;
    o.theta = THREE.MathUtils.damp(o.theta, stage.azimuth, 1.8, delta);
    o.phi = THREE.MathUtils.damp(o.phi, stage.polar ?? DEFAULT_POLAR, 1.8, delta);
    o.radius = THREE.MathUtils.damp(o.radius, stage.distance * fitScale(size), 1.8, delta);
    o.target.lerp(billWorld, 1 - Math.exp(-2.2 * delta));

    spherical.set(o.radius, o.phi, o.theta);
    camera.position.copy(offset.setFromSpherical(spherical).add(o.target));
    camera.lookAt(o.target);

    if (playing) {
      // Clamped: a backgrounded tab hands back one enormous delta on return,
      // which would otherwise skip several stages in a single frame.
      elapsed.current += Math.min(delta, 0.1);
      // What happens next is the view's call — move on, stop to ask the
      // stage's question, or finish — so this only says the time is up, and
      // says it once.
      if (elapsed.current >= STAGE_SECONDS) {
        elapsed.current = 0;
        onAdvance();
      }
    }
  });

  return (
    <group ref={rig}>
      <Document innerRef={bill} signed={last} />
    </group>
  );
}
