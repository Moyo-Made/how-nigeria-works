import {
  STONE_SHADE,
  GLASS,
  BRICK,
  BANNER,
  BRASS,
  LAWN,
  CONCRETE,
  CONCRETE_SHADE,
  CREAM,
} from "./materials.js";

// The headquarters of the Independent National Electoral Commission, Plot 436
// Zambezi Crescent, Maitama, Abuja — the address is on the sign at its gate.
//
// A schematic, like the other specimens, of what the street photographs show:
//   https://dailytrust.com/wp-content/uploads/2025/08/INEC.jpg            (tower and podium)
//   https://www.channelstv.com/wp-content/uploads/2020/04/INEC-Firee15.jpg (the same, from the other side)
//   https://cdn.guardian.ng/wp-content/uploads/2024/01/INEC.jpg           (the sign and the fence)
//   https://media.premiumtimesng.com/wp-content/files/2022/01/INEC-Headquarters.png (the gate)
//   https://abujaaffairs.com/wp-content/uploads/2025/12/INEC_Headquarter_Abuja.jpg  (gate and tower together)
//
// Two things on the site are left out. A lower block with blue-grey bands was
// photographed after a fire in 2020, but no frame shows where it stands
// relative to the tower. And a new annex had its ground broken beside the
// headquarters; it is in every recent search result as a rendering and is not
// a building yet.
//
// Every part is a direct child of the root so the model can be taken apart.

// The building's whole character is its frame: grey piers standing proud of the
// wall from the ground to a bracket at the roof, a cream panel and a strip of
// window between each pair, storey after storey.
function Framed({ width, height, depth, bays, storeys, glazedBay = -1, position }) {
  const bay = width / bays;
  const storey = height / storeys;
  const piers = Array.from({ length: bays + 1 }, (_, i) => -width / 2 + bay * i);
  const floors = Array.from({ length: storeys }, (_, i) => -height / 2 + storey * (i + 0.5));

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial {...CREAM} />
      </mesh>

      {/* a band of window to each storey, on the two long faces */}
      {floors.map((y) => (
        <mesh key={y} position={[0, y + storey * 0.12, 0]}>
          <boxGeometry args={[width - 0.02, storey * 0.42, depth + 0.012]} />
          <meshStandardMaterial {...GLASS} />
        </mesh>
      ))}

      {/* one bay is glazed from top to bottom */}
      {glazedBay >= 0 && (
        <mesh position={[-width / 2 + bay * (glazedBay + 0.5), 0, depth / 2 + 0.012]}>
          <boxGeometry args={[bay * 0.86, height * 0.94, 0.012]} />
          <meshStandardMaterial {...GLASS} />
        </mesh>
      )}

      {piers.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.045, height, depth + 0.09]} />
            <meshStandardMaterial {...CONCRETE} />
          </mesh>
          {/* the bracket each pier ends in under the roof */}
          <mesh position={[0, height / 2 - 0.05, 0]} castShadow>
            <boxGeometry args={[0.075, 0.1, depth + 0.15]} />
            <meshStandardMaterial {...CONCRETE} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, height / 2 + 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.08, 0.05, depth + 0.16]} />
        <meshStandardMaterial {...CONCRETE_SHADE} />
      </mesh>
    </group>
  );
}

function Ground() {
  return (
    <group>
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.9, 0.1, 3.0]} />
        <meshStandardMaterial {...STONE_SHADE} />
      </mesh>
      {[-1.35, 0.25].map((x) => (
        <mesh key={x} position={[x, 0.104, 0.98]} receiveShadow>
          <boxGeometry args={[1.3, 0.012, 0.42]} />
          <meshStandardMaterial {...LAWN} />
        </mesh>
      ))}
    </group>
  );
}

// Seven storeys, with the plant room standing on the roof.
function Tower() {
  return (
    <group>
      <Framed width={2.4} height={1.5} depth={0.72} bays={8} storeys={7} glazedBay={3} position={[0.3, 0.85, -0.62]} />
      <mesh position={[0.1, 1.72, -0.62]} castShadow>
        <boxGeometry args={[0.7, 0.16, 0.4]} />
        <meshStandardMaterial {...CONCRETE} />
      </mesh>
    </group>
  );
}

// The rounded stair tower that closes the end of the block.
function StairTower() {
  return (
    <group position={[1.62, 0, -0.56]}>
      <mesh position={[0, 0.88, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 1.56, 24]} />
        <meshStandardMaterial {...CONCRETE} />
      </mesh>
      <mesh position={[0, 1.68, 0]}>
        <cylinderGeometry args={[0.215, 0.215, 0.04, 24]} />
        <meshStandardMaterial {...CONCRETE_SHADE} />
      </mesh>
    </group>
  );
}

// A three-storey wing stands forward of the tower, built the same way, with a
// rounded corner where it meets the entrance.
function Podium() {
  return (
    <group>
      <Framed width={2.1} height={0.64} depth={0.74} bays={7} storeys={3} position={[-0.95, 0.42, 0.12]} />
      <mesh position={[0.16, 0.42, 0.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.66, 24]} />
        <meshStandardMaterial {...CONCRETE} />
      </mesh>
    </group>
  );
}

// The gate: an arch between two piers under a pitched sheet roof.
function Gate() {
  return (
    <group position={[1.62, 0.1, 1.08]}>
      {[-0.26, 0.26].map((x) => (
        <mesh key={x} position={[x, 0.16, 0]} castShadow>
          <boxGeometry args={[0.1, 0.32, 0.22]} />
          <meshStandardMaterial {...CREAM} />
        </mesh>
      ))}
      <mesh position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.31, 0.31, 0.22, 24, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial {...CREAM} />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.24, 24, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>
      {/* a triangular prism: a three-sided cylinder laid along the gate */}
      <mesh position={[0, 0.71, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 1, 0.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.34, 3]} />
        <meshStandardMaterial {...BRICK} />
      </mesh>
    </group>
  );
}

// The green pylon at the gate that carries the Commission's name and seal.
function Sign() {
  return (
    <group position={[0.98, 0.1, 1.22]}>
      <mesh position={[0, 0.24, 0]} castShadow>
        <boxGeometry args={[0.2, 0.48, 0.06]} />
        <meshStandardMaterial {...BANNER} />
      </mesh>
      <mesh position={[-0.04, 0.5, 0.01]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.085, 0.05, 24]} />
        <meshStandardMaterial {...CREAM} />
      </mesh>
      <mesh position={[-0.04, 0.5, 0.037]}>
        <torusGeometry args={[0.085, 0.008, 8, 24]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
    </group>
  );
}

// The perimeter fence is precast concrete in a wave pattern, and is as much the
// look of the place from the street as the tower is.
function Fence() {
  const posts = Array.from({ length: 40 }, (_, i) => -2.3 + i * 0.08);

  return (
    <group position={[0, 0.1, 1.34]}>
      {posts
        .filter((x) => x < 0.82)
        .map((x, i) => (
          <mesh key={x} position={[x, 0.07 + (i % 2) * 0.025, 0]} castShadow>
            <boxGeometry args={[0.06, 0.14, 0.03]} />
            <meshStandardMaterial {...CONCRETE} />
          </mesh>
        ))}
    </group>
  );
}

export default function Inec(props) {
  return (
    <group {...props}>
      <Ground />
      <Tower />
      <StairTower />
      <Podium />
      <Gate />
      <Sign />
      <Fence />
    </group>
  );
}
