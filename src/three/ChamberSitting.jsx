import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { speakingPlace } from "./chamberPlan.js";

const spherical = new THREE.Spherical();
const offset = new THREE.Vector3();

const STAGE_SECONDS = 9;

// The camera aims a little below where it is really looking, so the caption card
// along the bottom of the well covers empty carpet rather than the thing being
// described. Same trade the exterior sequence makes, and for the same reason —
// but a chamber is metres across where a specimen is centimetres, so the offset
// is in metres too.
const LOOK_BELOW = 0.5;
const lookBelow = ({ width, height }) =>
  LOOK_BELOW * THREE.MathUtils.clamp(width / height, 0.4, 1);

// A stage that names a member rather than a place gets its target from the seat
// generator, so the camera and the light that lands on them cannot disagree
// about which seat they mean.
const targetOf = (stage, place) => {
  if (stage.target) return stage.target;
  const x = Math.sin(place.angle) * place.radius;
  const z = Math.cos(place.angle) * place.radius;
  return [x, place.y + 1.15, z];
};

export default function ChamberSitting({ stages, index, playing, onAdvance }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const orbit = useRef(null);
  const elapsed = useRef(0);
  const aim = useRef(new THREE.Vector3());

  const place = useMemo(() => speakingPlace(), []);
  const stage = stages[index];
  const last = index === stages.length - 1;

  useEffect(() => {
    elapsed.current = 0;
  }, [index]);

  useFrame((_, delta) => {
    const [tx, ty, tz] = targetOf(stage, place);
    aim.current.set(tx, ty - lookBelow(size), tz);

    if (!orbit.current) {
      // Picked up from wherever the viewer left the camera rather than cutting
      // to the first stage — the room should not jump the moment you press play.
      offset.copy(camera.position).sub(aim.current);
      spherical.setFromVector3(offset);
      orbit.current = {
        theta: spherical.theta,
        phi: spherical.phi,
        radius: spherical.radius,
        target: aim.current.clone(),
      };
    }

    const o = orbit.current;
    o.theta = THREE.MathUtils.damp(o.theta, stage.azimuth, 1.7, delta);
    o.phi = THREE.MathUtils.damp(o.phi, stage.polar, 1.7, delta);
    o.radius = THREE.MathUtils.damp(o.radius, stage.distance, 1.7, delta);
    o.target.lerp(aim.current, 1 - Math.exp(-2.4 * delta));

    spherical.set(o.radius, o.phi, o.theta);
    camera.position.copy(offset.setFromSpherical(spherical).add(o.target));
    camera.lookAt(o.target);

    if (playing && !last) {
      // Clamped: a backgrounded tab hands back one enormous delta on return,
      // which would otherwise skip several stages in a single frame.
      elapsed.current += Math.min(delta, 0.1);
      if (elapsed.current >= STAGE_SECONDS) onAdvance();
    }
  });

  return null;
}
