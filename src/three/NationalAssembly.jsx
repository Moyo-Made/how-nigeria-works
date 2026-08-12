import { useMemo } from "react";
import * as THREE from "three";

import {
  STONE,
  STONE_SHADE,
  DOME_GREEN,
  ROOF_GREEN,
  GLASS,
  SLOT,
  BANNER,
  BRASS,
} from "./materials.js";

const OCT = Math.cos(Math.PI / 8); // circumradius -> face distance for an octagon
const SQ = 1 / Math.SQRT2; // circumradius -> half-extent for a square cylinder

// A 4-sided cylinder makes a rectangular frustum once rotated 45deg; `taper`
// drives the inward batter of the walls.
function Frustum({ width, depth, top, height, material, ...props }) {
  return (
    <mesh rotation={[0, Math.PI / 4, 0]} scale={[1, 1, depth / width]} castShadow receiveShadow {...props}>
      <cylinderGeometry args={[top / 2 / SQ, width / 2 / SQ, height, 4, 1]} />
      <meshStandardMaterial {...material} />
    </mesh>
  );
}

function Dome({ radius = 0.45, ribs = 16 }) {
  return (
    <group scale={[1, 1.2, 1]}>
      <mesh castShadow>
        <sphereGeometry args={[radius, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...DOME_GREEN} />
      </mesh>
      {Array.from({ length: ribs }, (_, i) => (
        <mesh key={i} rotation={[0, (i / ribs) * Math.PI * 2, 0]} castShadow>
          <torusGeometry args={[radius, 0.007, 6, 20, Math.PI / 2]} />
          <meshStandardMaterial {...DOME_GREEN} color="#3d7f5c" />
        </mesh>
      ))}
    </group>
  );
}

function Drum({ y }) {
  const R = 0.5;
  const faceZ = R * OCT;

  const pedimentGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.15, 0);
    s.lineTo(0.15, 0);
    s.lineTo(0, 0.11);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false });
  }, []);

  const mullions = useMemo(() => {
    const out = [];
    for (let f = 0; f < 8; f++) {
      const a = (f / 8) * Math.PI * 2;
      for (let m = -1; m <= 1; m++) {
        out.push({ a, offset: m * 0.11 });
      }
    }
    return out;
  }, []);

  return (
    <group position={[0, y, 0]} rotation={[0, Math.PI / 8, 0]}>
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[R, R * 1.04, 0.05, 8]} />
        <meshStandardMaterial {...STONE} />
      </mesh>

      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[R * 0.88, R * 0.88, 0.24, 8]} />
        <meshStandardMaterial {...SLOT} />
      </mesh>

      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        return (
          <mesh
            key={`pier-${i}`}
            position={[Math.sin(a) * R * 0.9, 0.17, Math.cos(a) * R * 0.9]}
            rotation={[0, a, 0]}
            castShadow
          >
            <boxGeometry args={[0.075, 0.24, 0.075]} />
            <meshStandardMaterial {...STONE} />
          </mesh>
        );
      })}

      {mullions.map(({ a, offset }, i) => (
        <group key={`mul-${i}`} rotation={[0, a, 0]}>
          <mesh position={[offset, 0.17, R * OCT * 0.94]}>
            <boxGeometry args={[0.032, 0.24, 0.025]} />
            <meshStandardMaterial {...STONE} />
          </mesh>
        </group>
      ))}

      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <group key={`tr-${i}`} rotation={[0, a, 0]}>
            <mesh position={[0, 0.17, R * OCT * 0.95]}>
              <boxGeometry args={[R * 0.78, 0.025, 0.022]} />
              <meshStandardMaterial {...STONE} />
            </mesh>
          </group>
        );
      })}

      <mesh position={[0, 0.315, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[R * 1.02, R, 0.05, 8]} />
        <meshStandardMaterial {...STONE} />
      </mesh>

      {[0, 1, 2, 3].map((i) => (
        <group key={`ped-${i}`} rotation={[0, (i * Math.PI) / 2, 0]}>
          <mesh geometry={pedimentGeo} position={[0, 0.335, faceZ - 0.02]} castShadow>
            <meshStandardMaterial {...STONE} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Finial({ y }) {
  return (
    <group position={[0, y, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.008, 0.012, 0.09, 8]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh position={[0, 0.06, 0]} castShadow>
        <sphereGeometry args={[0.022, 12, 10]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh position={[0, 0.095, 0]} castShadow>
        <coneGeometry args={[0.012, 0.05, 8]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
    </group>
  );
}

// The five-storey wings flanking the domed building. Not the chambers — both of
// those sit inside the central mass, either side of the atrium.
function WingBlock({ x }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.32, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[1.25, 0.44, 1.3]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
      <mesh position={[0, 0.4, -0.02]}>
        <boxGeometry args={[1.26, 0.13, 1.31]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>
      <mesh position={[0, 0.565, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[1.36, 0.05, 1.4]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
      <Frustum
        width={1.36}
        depth={1.4}
        top={0.34}
        height={0.26}
        material={ROOF_GREEN}
        position={[0, 0.72, -0.02]}
      />
    </group>
  );
}

function LowWing({ x }) {
  const piers = Array.from({ length: 7 }, (_, i) => -0.42 + i * 0.14);
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.28, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[1.05, 0.36, 1.2]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
      <mesh position={[0, 0.34, -0.05]}>
        <boxGeometry args={[1.06, 0.1, 1.21]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>
      <mesh position={[0, 0.475, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[1.12, 0.055, 1.26]} />
        <meshStandardMaterial {...STONE_SHADE} />
      </mesh>
      {piers.map((px) => (
        <mesh key={px} position={[px, 0.22, 0.58]} castShadow>
          <boxGeometry args={[0.042, 0.25, 0.042]} />
          <meshStandardMaterial {...STONE} />
        </mesh>
      ))}
    </group>
  );
}

function Portico() {
  const front = [-0.55, -0.19, 0.19, 0.55];
  return (
    <group position={[0, 0, 1.02]}>
      <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.32, 0.62]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
      <mesh position={[0, 0.24, 0.315]}>
        <boxGeometry args={[0.5, 0.14, 0.02]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>

      {front.map((px) => (
        <mesh key={`f${px}`} position={[px, 0.62, 0.26]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial {...STONE} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((px) => (
        <mesh key={`b${px}`} position={[px, 0.62, -0.22]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial {...STONE} />
        </mesh>
      ))}

      <mesh position={[0, 0.48, 0.28]} castShadow>
        <boxGeometry args={[1.24, 0.12, 0.035]} />
        <meshStandardMaterial {...STONE_SHADE} />
      </mesh>

      <mesh position={[0, 0.86, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[1.44, 0.075, 0.74]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
    </group>
  );
}

export default function NationalAssembly(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.7, 0.1, 2.2]} />
        <meshStandardMaterial {...STONE_SHADE} />
      </mesh>
      <mesh position={[0, 0.025, 1.22]} receiveShadow>
        <boxGeometry args={[4.7, 0.05, 0.26]} />
        <meshStandardMaterial {...STONE_SHADE} />
      </mesh>

      {/* green banner panels set into the forecourt retaining wall */}
      {Array.from({ length: 11 }, (_, i) => -2.1 + i * 0.42).map((bx) => (
        <mesh key={bx} position={[bx, 0.055, 1.106]}>
          <boxGeometry args={[0.09, 0.085, 0.012]} />
          <meshStandardMaterial {...BANNER} />
        </mesh>
      ))}

      <LowWing x={-1.78} />
      <LowWing x={1.78} />
      <WingBlock x={-1.02} />
      <WingBlock x={1.02} />

      <mesh position={[0, 0.43, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[1.55, 0.66, 1.45]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
      <mesh position={[0, 0.5, -0.02]}>
        <boxGeometry args={[1.56, 0.15, 1.46]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>

      <Frustum
        width={1.42}
        depth={1.32}
        top={1.05}
        height={0.3}
        material={STONE}
        position={[0, 0.91, -0.02]}
      />
      <mesh position={[0, 1.085, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[1.14, 0.05, 1.06]} />
        <meshStandardMaterial {...STONE} />
      </mesh>

      <Drum y={1.11} />

      <mesh position={[0, 1.46, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.47, 0.51, 0.04, 32]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
      <group position={[0, 1.48, 0]}>
        <Dome />
      </group>
      <Finial y={2.02} />

      <Portico />
    </group>
  );
}
