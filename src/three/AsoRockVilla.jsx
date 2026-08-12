import { useMemo } from "react";
import * as THREE from "three";
import {
  STONE,
  STONE_SHADE,
  DOME_GREEN,
  TRIM_GREEN,
  GLASS,
  BRASS,
  WATER,
  GRANITE,
  LAWN,
} from "./materials.js";

// Round-headed arcade cut as holes through an extruded wall, which keeps the
// arch profile true rather than faking it with boxes.
function ArcadeWall({ width, height, depth, count, bayWidth = 0.62, material = STONE }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(width / 2, 0);
    shape.lineTo(width / 2, height);
    shape.lineTo(-width / 2, height);
    shape.closePath();

    const pitch = width / count;
    const w = pitch * bayWidth;
    const r = w / 2;
    const springing = height * 0.46;

    for (let i = 0; i < count; i++) {
      const cx = -width / 2 + pitch * (i + 0.5);
      const hole = new THREE.Path();
      hole.moveTo(cx - r, 0);
      hole.lineTo(cx - r, springing);
      hole.absarc(cx, springing, r, Math.PI, 0, true);
      hole.lineTo(cx + r, 0);
      hole.closePath();
      shape.holes.push(hole);
    }

    return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  }, [width, height, depth, count, bayWidth]);

  return (
    <mesh geometry={geometry} position={[0, 0, -depth / 2]} castShadow receiveShadow>
      <meshStandardMaterial {...material} />
    </mesh>
  );
}

// Shallow saucer dome over the central block.
function SaucerDome({ radius = 0.74 }) {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius * 0.97, radius * 1.02, 0.07, 40]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
      <group position={[0, 0.05, 0]} scale={[1, 0.46, 1]}>
        <mesh castShadow>
          <sphereGeometry args={[radius * 0.95, 44, 22, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial {...DOME_GREEN} />
        </mesh>
      </group>
      <mesh position={[0, 0.31, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.06, 16]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.05, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...DOME_GREEN} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.006, 0.009, 0.07, 8]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
    </group>
  );
}

// Aso Rock itself — the granite inselberg the villa is named for and sits below.
function Monolith() {
  const geometry = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n =
        Math.sin(v.x * 3.1 + v.z * 1.7) * 0.06 +
        Math.sin(v.z * 4.3 - v.x * 2.2) * 0.045 +
        Math.sin(v.x * 7.9 + v.z * 6.1) * 0.02;
      const k = 1 + n * (0.35 + v.y * 0.65);
      pos.setXYZ(i, v.x * k, v.y * (1 + n * 0.5), v.z * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geometry} position={[0.15, 0, -2.15]} scale={[2.3, 1.75, 1.15]} castShadow receiveShadow>
      <meshStandardMaterial {...GRANITE} flatShading />
    </mesh>
  );
}

// Wings splay forward from the centre around the circular forecourt.
function Wing({ side }) {
  return (
    <group position={[side * 1.58, 0, 0.14]} rotation={[0, side * -0.2, 0]}>
      <mesh position={[0, 0.31, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.62, 0.85]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <boxGeometry args={[1.91, 0.14, 0.86]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>
      <mesh position={[0, 0.655, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.98, 0.06, 0.94]} />
        <meshStandardMaterial {...TRIM_GREEN} />
      </mesh>
      <group position={[0, 0, 0.425]}>
        <ArcadeWall width={1.9} height={0.42} depth={0.1} count={7} material={STONE_SHADE} />
      </group>
    </group>
  );
}

export default function AsoRockVilla(props) {
  return (
    <group {...props}>
      <Monolith />

      <mesh position={[0, 0.04, -0.2]} receiveShadow>
        <boxGeometry args={[5.4, 0.08, 3.4]} />
        <meshStandardMaterial {...LAWN} />
      </mesh>
      <mesh position={[0, 0.085, -0.2]} receiveShadow>
        <boxGeometry args={[4.9, 0.02, 2.9]} />
        <meshStandardMaterial {...STONE_SHADE} />
      </mesh>

      <Wing side={-1} />
      <Wing side={1} />

      <mesh position={[0, 0.4, -0.55]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.8, 1.5]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
      <mesh position={[0, 0.55, -0.55]}>
        <boxGeometry args={[2.01, 0.16, 1.51]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>
      <mesh position={[0, 0.83, -0.55]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.07, 1.6]} />
        <meshStandardMaterial {...STONE_SHADE} />
      </mesh>

      {/* the deep arched porte-cochere across the entrance front */}
      <group position={[0, 0.1, 0.22]}>
        <ArcadeWall width={2.1} height={0.62} depth={0.18} count={7} />
      </group>
      <mesh position={[0, 0.75, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.07, 0.42]} />
        <meshStandardMaterial {...STONE} />
      </mesh>

      <group position={[0, 0.87, -0.5]}>
        <SaucerDome />
      </group>

      {/* circular forecourt drive with its central fountain */}
      <mesh position={[0, 0.101, 1.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0.42, 0.96, 48]} />
        <meshStandardMaterial {...LAWN} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.103, 1.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0.78, 0.96, 48]} />
        <meshStandardMaterial {...STONE_SHADE} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.105, 1.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.4, 32]} />
        <meshStandardMaterial {...WATER} />
      </mesh>
      <mesh position={[0, 0.18, 1.0]}>
        <coneGeometry args={[0.07, 0.2, 14, 1, true]} />
        <meshStandardMaterial {...WATER} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
