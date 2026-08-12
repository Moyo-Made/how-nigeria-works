import { Circle } from "@react-three/drei";

export default function Plinth({ radius = 1.6, height = 0.28 }) {
  return (
    <group position={[0, -0.02, 0]}>
      {/* shadow-catching floor, kept just under the plinth top */}
      <Circle args={[radius * 6, 64]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -height, 0]} receiveShadow>
        <shadowMaterial transparent opacity={0.35} />
      </Circle>

      <mesh position={[0, -height / 2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[radius, radius * 1.06, height, 64]} />
        <meshStandardMaterial color="#0e2a1f" roughness={0.75} metalness={0.1} />
      </mesh>

      {/* brass inlay ring reading as the specimen's baseline */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.9, radius * 0.94, 64]} />
        <meshStandardMaterial color="#c9a227" roughness={0.35} metalness={0.8} />
      </mesh>
    </group>
  );
}
