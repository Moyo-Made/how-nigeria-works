import {
  STONE,
  STONE_SHADE,
  TRIM_GREEN,
  GLASS,
  BRICK,
  BRICK_DARK,
  WATER,
  BRASS,
  LAWN,
} from "./materials.js";

// The dominant rear mass is clad in reddish-brown stone and broken up by deep
// vertical fins; recesses read dark, the fins catch the light.
function RibbedMass({ width, height, depth, fins, position }) {
  const bay = width / fins;
  const xs = Array.from({ length: fins }, (_, i) => -width / 2 + bay * (i + 0.5));
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial {...BRICK_DARK} />
      </mesh>
      {xs.map((x) => (
        <mesh key={x} position={[x, 0, depth / 2 + 0.015]} castShadow>
          <boxGeometry args={[bay * 0.66, height * 0.99, 0.03]} />
          <meshStandardMaterial {...BRICK} />
        </mesh>
      ))}
      <mesh position={[0, height / 2 + 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.07, 0.06, depth + 0.07]} />
        <meshStandardMaterial {...BRICK} />
      </mesh>
    </group>
  );
}

function Steps() {
  const treads = [
    { w: 1.9, y: 0.115, z: 0.66, d: 0.14 },
    { w: 1.78, y: 0.145, z: 0.56, d: 0.12 },
    { w: 1.66, y: 0.175, z: 0.47, d: 0.11 },
    { w: 1.54, y: 0.205, z: 0.39, d: 0.1 },
  ];
  return (
    <group>
      {treads.map((t) => (
        <mesh key={t.y} position={[0, t.y, t.z]} receiveShadow castShadow>
          <boxGeometry args={[t.w, 0.045, t.d]} />
          <meshStandardMaterial {...STONE_SHADE} />
        </mesh>
      ))}
    </group>
  );
}

// Flat entrance canopy carrying the coat of arms and the court's name band.
function EntranceCanopy() {
  const columns = [-0.62, -0.21, 0.21, 0.62];
  return (
    <group position={[0, 0, 0.22]}>
      {columns.map((x) => (
        <mesh key={x} position={[x, 0.36, 0.16]} castShadow>
          <boxGeometry args={[0.085, 0.52, 0.085]} />
          <meshStandardMaterial {...STONE} />
        </mesh>
      ))}

      <mesh position={[0, 0.66, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[1.72, 0.075, 0.68]} />
        <meshStandardMaterial {...STONE} />
      </mesh>

      <mesh position={[0, 0.755, 0.24]} castShadow receiveShadow>
        <boxGeometry args={[1.62, 0.16, 0.075]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
      <mesh position={[0, 0.755, 0.283]}>
        <boxGeometry args={[1.1, 0.05, 0.012]} />
        <meshStandardMaterial {...STONE_SHADE} />
      </mesh>

      <mesh position={[0, 0.885, 0.24]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.03, 24]} />
        <meshStandardMaterial {...TRIM_GREEN} />
      </mesh>
      <mesh position={[0, 0.885, 0.257]}>
        <torusGeometry args={[0.075, 0.008, 8, 24]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>

      <mesh position={[0, 0.35, -0.12]}>
        <boxGeometry args={[0.9, 0.5, 0.04]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>
    </group>
  );
}

function FrontWing({ x, width }) {
  const bays = Math.round(width / 0.22);
  const xs = Array.from({ length: bays }, (_, i) => -width / 2 + (width / bays) * (i + 0.5));
  return (
    <group position={[x, 0, -0.12]}>
      <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.52, 0.92]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[width + 0.01, 0.13, 0.93]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>
      <mesh position={[0, 0.645, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.08, 0.06, 1.0]} />
        <meshStandardMaterial {...TRIM_GREEN} />
      </mesh>
      {xs.map((bx) => (
        <mesh key={bx} position={[bx, 0.27, 0.475]} castShadow>
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <meshStandardMaterial {...STONE} />
        </mesh>
      ))}
      {/* green awnings over the ground-floor windows */}
      {xs.filter((_, i) => i % 2 === 0).map((bx) => (
        <mesh key={`a${bx}`} position={[bx + 0.11, 0.4, 0.48]} castShadow>
          <boxGeometry args={[0.17, 0.02, 0.07]} />
          <meshStandardMaterial {...TRIM_GREEN} />
        </mesh>
      ))}
    </group>
  );
}

export default function SupremeCourt(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.9, 0.1, 3.0]} />
        <meshStandardMaterial {...STONE_SHADE} />
      </mesh>

      <RibbedMass width={1.3} height={1.18} depth={1.1} fins={8} position={[0, 0.79, -0.9]} />
      <RibbedMass width={0.86} height={1.0} depth={1.02} fins={5} position={[-1.06, 0.7, -0.94]} />
      <RibbedMass width={0.86} height={1.0} depth={1.02} fins={5} position={[1.06, 0.7, -0.94]} />

      <FrontWing x={-1.42} width={1.6} />
      <FrontWing x={1.42} width={1.6} />

      <mesh position={[0, 0.36, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.52, 0.92]} />
        <meshStandardMaterial {...STONE} />
      </mesh>

      <EntranceCanopy />
      <Steps />

      {/* reflecting pool and fountain on the forecourt axis */}
      <mesh position={[0, 0.1, 1.16]} receiveShadow>
        <boxGeometry args={[1.62, 0.04, 0.74]} />
        <meshStandardMaterial {...STONE_SHADE} />
      </mesh>
      <mesh position={[0, 0.118, 1.16]} receiveShadow>
        <boxGeometry args={[1.46, 0.02, 0.58]} />
        <meshStandardMaterial {...WATER} />
      </mesh>
      <mesh position={[0, 0.21, 1.16]}>
        <coneGeometry args={[0.05, 0.18, 12, 1, true]} />
        <meshStandardMaterial {...WATER} transparent opacity={0.55} />
      </mesh>

      {[-1.42, 1.42].map((lx) => (
        <mesh key={lx} position={[lx, 0.104, 1.2]} receiveShadow>
          <boxGeometry args={[1.5, 0.012, 0.9]} />
          <meshStandardMaterial {...LAWN} />
        </mesh>
      ))}
    </group>
  );
}
