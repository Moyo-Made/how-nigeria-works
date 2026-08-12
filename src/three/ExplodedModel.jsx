import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import ModelSlot from "./ModelSlot.jsx";

const box = new THREE.Box3();
const sphere = new THREE.Sphere();
const partCentre = new THREE.Vector3();
const hostCentre = new THREE.Vector3();
const toLocal = new THREE.Matrix4();

const SPREAD = 0.32; // of the model's radius, at full separation
const LIFT = 0.8; // how far the upper storeys rise relative to spreading out
const MIN_PARTS = 3;

// The separable parts sit below however many wrapper groups the loader and the
// GLB fitter added, so descend past single-child links to reach the node that
// actually holds the massing.
function findPartsHost(root) {
  let node = root;
  while (node.children.length === 1 && node.children[0].children?.length > 0) {
    node = node.children[0];
  }
  return node;
}

// Box3.setFromObject reports world space but obj.position is parent-local, so
// every measurement is brought back into the host's own space before it is used
// to offset a child.
function measure(root) {
  const host = findPartsHost(root);
  host.updateWorldMatrix(true, true);
  toLocal.copy(host.matrixWorld).invert();

  box.setFromObject(host).applyMatrix4(toLocal);
  box.getBoundingSphere(sphere);
  hostCentre.copy(sphere.center);

  // Lift is normalised against the model's real height, not its bounding
  // radius: these buildings are far wider than they are tall, and a radius
  // would give even the ground slab a shove upward.
  const floor = box.min.y;
  const height = Math.max(box.max.y - floor, 1e-6);

  const parts = host.children.map((obj) => {
    box.setFromObject(obj).applyMatrix4(toLocal);
    box.getCenter(partCentre);

    // Outward in plan, upward by how high the part already sits: the reading
    // of an exploded architectural drawing rather than a scatter.
    const dir = new THREE.Vector3(
      partCentre.x - hostCentre.x,
      0,
      partCentre.z - hostCentre.z
    );
    if (dir.lengthSq() > 1e-6) dir.normalize();
    dir.y = THREE.MathUtils.clamp((partCentre.y - floor) / height, 0, 1) * LIFT;

    return { obj, base: obj.position.clone(), dir };
  });

  return { parts, distance: sphere.radius * SPREAD };
}

export default function ExplodedModel({ id, exploded, onStructure, groupRef }) {
  const state = useRef({ parts: null, distance: 0, t: 0, signature: null });

  useEffect(() => {
    state.current = { parts: null, distance: 0, t: 0, signature: null };
    onStructure(false);
  }, [id, onStructure]);

  useFrame((_, delta) => {
    const root = groupRef.current;
    const s = state.current;
    if (!root || root.children.length === 0) return;

    // The loading placeholder occupies the group first and the real model
    // replaces it, so the scan follows what is currently mounted rather than
    // latching whatever happened to be there on the first frame. Re-measuring
    // while separated would capture displaced positions as the base.
    const host = findPartsHost(root);
    const signature = `${host.uuid}:${host.children.length}`;

    if (signature !== s.signature && s.t === 0) {
      s.signature = signature;
      const measured = measure(root);
      const enough = measured.parts.length >= MIN_PARTS;
      // A single merged mesh cannot be taken apart; say so rather than
      // offering a control that quietly does nothing.
      s.parts = enough ? measured.parts : [];
      s.distance = measured.distance;
      onStructure(enough);
    }

    if (!s.parts?.length) return;

    const target = exploded ? 1 : 0;
    if (Math.abs(s.t - target) < 0.001) {
      if (s.t !== target) {
        s.t = target;
        s.parts.forEach(({ obj, base, dir }) =>
          obj.position.copy(base).addScaledVector(dir, s.distance * target)
        );
      }
      return;
    }

    s.t = THREE.MathUtils.damp(s.t, target, 4, delta);
    const eased = s.t * s.t * (3 - 2 * s.t);
    s.parts.forEach(({ obj, base, dir }) =>
      obj.position.copy(base).addScaledVector(dir, s.distance * eased)
    );
  });

  return (
    <group ref={groupRef}>
      <ModelSlot id={id} />
    </group>
  );
}
