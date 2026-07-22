import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls, Text } from '@react-three/drei';

type World3DProps = {
  onBackToMap: () => void;
};

const clayMaterial = {
  roughness: 0.9,
  metalness: 0.05,
};

function Island() {
  return (
    <group>
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3, 3.5, 1, 32]} />
        <meshStandardMaterial color="#d5f5e3" {...clayMaterial} />
      </mesh>
      <mesh position={[0, -0.58, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.7, 0.28, 32]} />
        <meshStandardMaterial color="#e8daef" roughness={0.95} metalness={0.02} />
      </mesh>
    </group>
  );
}

function Water() {
  return (
    <mesh position={[0, -0.82, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[5.4, 64]} />
      <meshStandardMaterial color="#76d7c4" transparent opacity={0.6} roughness={0.3} metalness={0.02} />
    </mesh>
  );
}

function MarketingBuilding() {
  return (
    <Float speed={2} rotationIntensity={0.08} floatIntensity={0.25}>
      <group position={[1.5, 0, 0]}>
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[1, 1.5, 1]} />
          <meshStandardMaterial color="#fadbd8" {...clayMaterial} />
        </mesh>
        <mesh position={[0, 1.9, 0]} castShadow>
          <boxGeometry args={[1.2, 0.3, 1.2]} />
          <meshStandardMaterial color="#f4d03f" {...clayMaterial} />
        </mesh>
        <mesh position={[0, 1.1, 0.51]} castShadow>
          <boxGeometry args={[0.28, 0.34, 0.04]} />
          <meshStandardMaterial color="#e8daef" {...clayMaterial} />
        </mesh>
      </group>
    </Float>
  );
}

function FinanceBuilding() {
  return (
    <Float speed={1.9} rotationIntensity={0.08} floatIntensity={0.22}>
      <group position={[-1.5, 0, 0]}>
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[1, 1.5, 1]} />
          <meshStandardMaterial color="#fef5e7" {...clayMaterial} />
        </mesh>
        <mesh position={[0, 1.85, 0]} castShadow>
          <coneGeometry args={[0.78, 0.55, 4]} />
          <meshStandardMaterial color="#e8daef" {...clayMaterial} />
        </mesh>
        <mesh position={[0, 1.03, 0.51]} castShadow>
          <boxGeometry args={[0.32, 0.42, 0.04]} />
          <meshStandardMaterial color="#76d7c4" {...clayMaterial} />
        </mesh>
      </group>
    </Float>
  );
}

function Trees() {
  const trees: Array<[number, number, number]> = [
    [-2, 0.5, 1],
    [2, 0.5, -1],
    [-1, 0.5, 2],
    [0.6, 0.5, -2.1],
  ];

  return (
    <>
      {trees.map((position, index) => (
        <group key={`${position.join('-')}-${index}`} position={position}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 0.55, 12]} />
            <meshStandardMaterial color="#b68d6a" {...clayMaterial} />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.42, 16, 16]} />
            <meshStandardMaterial color="#27ae60" {...clayMaterial} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Pearls() {
  const pearls: Array<[number, number, number]> = [
    [2, 3, 2],
    [-2, 2.5, -2],
    [0, 3.5, 0],
    [2.8, 2.2, -1.5],
  ];

  return (
    <>
      {pearls.map((position, index) => (
        <Float key={`${position.join('-')}-${index}`} speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={position} castShadow>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.1}
              metalness={0.8}
              emissive="#c39bd3"
              emissiveIntensity={0.2}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function Sailboat() {
  return (
    <Float speed={1.4} rotationIntensity={0.04} floatIntensity={0.18}>
      <group position={[-3.45, -0.28, 1.35]} rotation={[0, -0.55, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.05, 0.28, 0.42]} />
          <meshStandardMaterial color="#ffffff" roughness={0.82} metalness={0.04} />
        </mesh>
        <mesh position={[0, 0.52, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 1.2, 12]} />
          <meshStandardMaterial color="#fef5e7" {...clayMaterial} />
        </mesh>
        <mesh position={[0.28, 0.73, 0.03]} rotation={[0, 0, -0.16]} castShadow>
          <planeGeometry args={[0.62, 0.5]} />
          <meshStandardMaterial color="#fadbd8" side={2} {...clayMaterial} />
        </mesh>
        <Text
          position={[0.29, 0.73, 0.055]}
          rotation={[0, -0.02, -0.16]}
          fontSize={0.16}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          :)
        </Text>
      </group>
    </Float>
  );
}

function WorldScene() {
  return (
    <>
      <color attach="background" args={['#f5f0ff']} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Water />
      <Island />
      <MarketingBuilding />
      <FinanceBuilding />
      <Trees />
      <Pearls />
      <Sailboat />
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={15}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
      />
    </>
  );
}

export default function World3D({ onBackToMap }: World3DProps) {
  return (
    <section className="foru-world3d-shell" aria-label="Mundito 3D de proyectos">
      <button type="button" className="foru-world3d-back" onClick={onBackToMap}>
        Volver al Mapa
      </button>

      <Canvas shadows camera={{ position: [8, 8, 8], fov: 45 }} className="foru-world3d-canvas">
        <WorldScene />
      </Canvas>
    </section>
  );
}
