import { useMemo } from "react";

const STONE = { color: "#e6e2d7", roughness: 0.85, metalness: 0.02 };
const ACCENT = { color: "#008751", roughness: 0.45, metalness: 0.15 };

// Generic civic massing used until a real GLB lands for an institution:
// stepped base, colonnade, entablature, and an optional dome.
export default function PlaceholderBuilding({ dome = true, columns = 10, width = 1.9, depth = 1.1 }) {
  const columnPositions = useMemo(() => {
    const span = width * 0.82;
    return Array.from({ length: columns }, (_, i) => {
      const t = columns === 1 ? 0.5 : i / (columns - 1);
      return -span / 2 + t * span;
    });
  }, [columns, width]);

  return (
    <group>
      <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 1.12, 0.14, depth * 1.2]} />
        <meshStandardMaterial {...STONE} />
      </mesh>

      <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial {...STONE} />
      </mesh>

      {columnPositions.map((x) => (
        <mesh key={x} position={[x, 0.53, depth / 2 - 0.08]} castShadow>
          <cylinderGeometry args={[0.055, 0.06, 0.58, 12]} />
          <meshStandardMaterial {...STONE} />
        </mesh>
      ))}

      <mesh position={[0, 0.5, -depth * 0.1]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.86, 0.6, depth * 0.72]} />
        <meshStandardMaterial {...STONE} />
      </mesh>

      <mesh position={[0, 0.86, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.12, depth]} />
        <meshStandardMaterial {...STONE} />
      </mesh>

      {dome && (
        <group position={[0, 0.92, -depth * 0.05]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.38, 0.44, 0.14, 32]} />
            <meshStandardMaterial {...STONE} />
          </mesh>
          <mesh position={[0, 0.07, 0]} castShadow>
            <sphereGeometry args={[0.38, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial {...ACCENT} />
          </mesh>
          <mesh position={[0, 0.48, 0]} castShadow>
            <sphereGeometry args={[0.055, 16, 12]} />
            <meshStandardMaterial color="#c9a227" roughness={0.3} metalness={0.85} />
          </mesh>
        </group>
      )}
    </group>
  );
}
