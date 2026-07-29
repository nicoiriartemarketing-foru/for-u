import { Float, Html } from '@react-three/drei';

type MascotGuideProps = {
  message: string;
};

export default function MascotGuide({ message }: MascotGuideProps) {
  return (
    <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.18}>
      <group position={[-1.6, 0.24, 1.2]}>
        <mesh position={[0, 0.36, 0]} castShadow>
          <sphereGeometry args={[0.32, 24, 18]} />
          <meshPhysicalMaterial color="#FFD1DC" roughness={0.82} metalness={0.04} clearcoat={0.2} />
        </mesh>
        <mesh position={[-0.13, 0.5, 0.26]} castShadow>
          <sphereGeometry args={[0.045, 12, 8]} />
          <meshStandardMaterial color="#4A4A4A" />
        </mesh>
        <mesh position={[0.13, 0.5, 0.26]} castShadow>
          <sphereGeometry args={[0.045, 12, 8]} />
          <meshStandardMaterial color="#4A4A4A" />
        </mesh>
        <mesh position={[0, 0.24, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.28, 0.34, 20]} />
          <meshPhysicalMaterial color="#E6E6FA" roughness={0.86} metalness={0.03} clearcoat={0.12} />
        </mesh>
        <Html position={[0.1, 1.1, 0]} center distanceFactor={6}>
          <div className="foru-world-speech">
            {message}
          </div>
        </Html>
      </group>
    </Float>
  );
}
