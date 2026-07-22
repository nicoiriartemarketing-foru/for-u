import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Html, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, N8AO } from '@react-three/postprocessing';
import { PCFSoftShadowMap, Vector3, type PointLight } from 'three';
import BuildingInterior from './BuildingInterior';
import Sailboat from './Sailboat';
import TaskProp from './TaskProp';
import { type ForUBranchKey, type ForUProjectNode, type ForUWorldViewLevel, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

type World3DProps = {
  onBackToMap: () => void;
};

type BranchCounts = Record<ForUBranchKey, number>;

type BuildingConfig = {
  branchKey: ForUBranchKey;
  name: string;
  position: [number, number, number];
  color: string;
  roofColor: string;
  speed: number;
  rotationIntensity: number;
  floatIntensity: number;
  shape: 'box' | 'tower' | 'studio' | 'dome' | 'resource';
};

const inactiveColor = '#d5d5d5';

const clayMaterial = {
  roughness: 0.7,
  metalness: 0.1,
  clearcoat: 0.3,
};

const softClayMaterial = {
  roughness: 0.9,
  metalness: 0.05,
};

const buildingConfigs: BuildingConfig[] = [
  {
    branchKey: 'ideas',
    name: 'Ideas',
    position: [-1.85, 0, 1.35],
    color: '#e8daef',
    roofColor: '#ffffff',
    speed: 1.25,
    rotationIntensity: 0.07,
    floatIntensity: 0.2,
    shape: 'dome',
  },
  {
    branchKey: 'actions',
    name: 'Acciones',
    position: [0.2, 0, -1.75],
    color: '#d5f5e3',
    roofColor: '#76d7c4',
    speed: 1.75,
    rotationIntensity: 0.1,
    floatIntensity: 0.28,
    shape: 'tower',
  },
  {
    branchKey: 'finances',
    name: 'Finanzas',
    position: [-1.45, 0, -0.25],
    color: '#fef5e7',
    roofColor: '#e8daef',
    speed: 2,
    rotationIntensity: 0.08,
    floatIntensity: 0.25,
    shape: 'box',
  },
  {
    branchKey: 'marketing',
    name: 'Marketing',
    position: [1.55, 0, 0],
    color: '#fadbd8',
    roofColor: '#f4d03f',
    speed: 1.5,
    rotationIntensity: 0.12,
    floatIntensity: 0.32,
    shape: 'studio',
  },
  {
    branchKey: 'resources',
    name: 'Recursos',
    position: [1.6, 0, 1.55],
    color: '#76d7c4',
    roofColor: '#fef5e7',
    speed: 2.25,
    rotationIntensity: 0.06,
    floatIntensity: 0.22,
    shape: 'resource',
  },
];

function getBuildingScale(count: number) {
  if (count === 0) return 0.8;
  if (count >= 4) return 1.3;

  return 1;
}

function getTaskLabel(count: number) {
  if (count === 1) return '1 nodo';
  return `${count} nodos`;
}

function ActivityLight({ count, color }: { count: number; color: string }) {
  const lightRef = useRef<PointLight>(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    lightRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 3.2) * 0.35;
  });

  if (count <= 3) return null;

  return <pointLight ref={lightRef} position={[0, 3.1, 0]} color={color} distance={4.5} intensity={1} />;
}

function BuildingGeometry({ shape, color, roofColor }: Pick<BuildingConfig, 'shape' | 'color' | 'roofColor'>) {
  if (shape === 'tower') {
    return (
      <>
        <mesh position={[0, 1.05, 0]} castShadow>
          <cylinderGeometry args={[0.52, 0.64, 1.65, 18]} />
          <meshPhysicalMaterial color={color} {...clayMaterial} />
        </mesh>
        <mesh position={[0, 2.02, 0]} castShadow>
          <coneGeometry args={[0.72, 0.5, 18]} />
          <meshPhysicalMaterial color={roofColor} {...clayMaterial} />
        </mesh>
      </>
    );
  }

  if (shape === 'studio') {
    return (
      <>
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[1, 1.5, 1]} />
          <meshPhysicalMaterial color={color} {...clayMaterial} />
        </mesh>
        <mesh position={[0, 1.9, 0]} castShadow>
          <boxGeometry args={[1.2, 0.3, 1.2]} />
          <meshPhysicalMaterial color={roofColor} {...clayMaterial} />
        </mesh>
        <mesh position={[0, 1.1, 0.51]} castShadow>
          <boxGeometry args={[0.28, 0.34, 0.04]} />
          <meshPhysicalMaterial color="#e8daef" {...clayMaterial} />
        </mesh>
      </>
    );
  }

  if (shape === 'dome') {
    return (
      <>
        <mesh position={[0, 0.8, 0]} castShadow>
          <sphereGeometry args={[0.68, 24, 16]} />
          <meshPhysicalMaterial color={color} {...clayMaterial} />
        </mesh>
        <mesh position={[0, 0.36, 0]} castShadow>
          <cylinderGeometry args={[0.68, 0.72, 0.35, 24]} />
          <meshPhysicalMaterial color={roofColor} {...clayMaterial} />
        </mesh>
      </>
    );
  }

  if (shape === 'resource') {
    return (
      <>
        <mesh position={[0, 0.86, 0]} castShadow>
          <boxGeometry args={[1.05, 1.2, 0.86]} />
          <meshPhysicalMaterial color={color} {...clayMaterial} />
        </mesh>
        <mesh position={[0, 1.58, 0]} rotation={[0, 0.78, 0]} castShadow>
          <boxGeometry args={[0.88, 0.28, 0.88]} />
          <meshPhysicalMaterial color={roofColor} {...clayMaterial} />
        </mesh>
      </>
    );
  }

  return (
    <>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1, 1.5, 1]} />
        <meshPhysicalMaterial color={color} {...clayMaterial} />
      </mesh>
      <mesh position={[0, 1.85, 0]} castShadow>
        <coneGeometry args={[0.78, 0.55, 4]} />
        <meshPhysicalMaterial color={roofColor} {...clayMaterial} />
      </mesh>
      <mesh position={[0, 1.03, 0.51]} castShadow>
        <boxGeometry args={[0.32, 0.42, 0.04]} />
        <meshPhysicalMaterial color="#76d7c4" {...clayMaterial} />
      </mesh>
    </>
  );
}

function BranchBuilding({
  config,
  count,
  viewLevel,
  isActive,
  onSelect,
  onEnter,
}: {
  config: BuildingConfig;
  count: number;
  viewLevel: ForUWorldViewLevel;
  isActive: boolean;
  onSelect: (branchKey: ForUBranchKey) => void;
  onEnter: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const scale = getBuildingScale(count);
  const color = count === 0 ? inactiveColor : config.color;
  const roofColor = count === 0 ? '#ededed' : config.roofColor;
  const shouldDim = viewLevel === 'exterior' && !isActive;

  if (viewLevel === 'interior' || shouldDim) return null;

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setIsHovered(true);
  }

  function handlePointerOut(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setIsHovered(false);
  }

  return (
    <Float speed={config.speed} rotationIntensity={config.rotationIntensity} floatIntensity={config.floatIntensity}>
      <group
        position={config.position}
        scale={[scale, scale, scale]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(config.branchKey);
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();
          onSelect(config.branchKey);
          onEnter();
        }}
      >
        <BuildingGeometry shape={config.shape} color={color} roofColor={roofColor} />
        <ActivityLight count={count} color={config.color} />
        {isHovered ? (
          <Html position={[0, 2.75, 0]} center distanceFactor={7}>
            <div className="foru-world3d-tooltip">
              <strong>{config.name}</strong>
              <span>{getTaskLabel(count)}</span>
            </div>
          </Html>
        ) : null}
        {viewLevel === 'exterior' && isActive ? (
          <Html position={[0, 3.05, 0]} center distanceFactor={8}>
            <button type="button" className="foru-world3d-level-button" onClick={onEnter}>
              🚪 Entrar
            </button>
          </Html>
        ) : null}
      </group>
    </Float>
  );
}

function Island({ onSelect }: { onSelect: () => void }) {
  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3, 3.5, 1, 32]} />
        <meshPhysicalMaterial color="#d5f5e3" {...softClayMaterial} clearcoat={0.18} />
      </mesh>
      <mesh position={[0, -0.58, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.7, 0.28, 32]} />
        <meshPhysicalMaterial color="#e8daef" roughness={0.95} metalness={0.02} clearcoat={0.1} />
      </mesh>
    </group>
  );
}

function Water() {
  return (
    <mesh position={[0, -0.82, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[5.4, 64]} />
      <meshPhysicalMaterial
        color="#76d7c4"
        transparent
        opacity={0.62}
        transmission={0.6}
        roughness={0.1}
        metalness={0.02}
        thickness={0.24}
        clearcoat={0.55}
      />
    </mesh>
  );
}

function Lighthouses() {
  const lighthouses: Array<[number, number, number]> = [
    [-2.65, 0.5, -1.3],
    [2.55, 0.5, 1.05],
  ];

  return (
    <>
      {lighthouses.map((position, index) => (
        <group key={`${position.join('-')}-${index}`} position={position}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.24, 0.9, 18]} />
            <meshPhysicalMaterial color="#ffffff" {...clayMaterial} />
          </mesh>
          <mesh position={[0, 0.98, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.2, 0.18, 18]} />
            <meshPhysicalMaterial color="#fef5e7" roughness={0.35} metalness={0.08} clearcoat={0.45} />
          </mesh>
          <mesh position={[0, 1.14, 0]} castShadow>
            <sphereGeometry args={[0.13, 18, 18]} />
            <meshPhysicalMaterial color="#fff7cc" emissive="#fff1a8" emissiveIntensity={1.15} roughness={0.24} metalness={0.12} />
          </mesh>
          <pointLight position={[0, 1.25, 0]} color="#fff1a8" distance={3.4} intensity={0.65} />
        </group>
      ))}
    </>
  );
}

function Trees() {
  const trees: Array<[number, number, number]> = [
    [-2.45, 0.5, 0.45],
    [2.15, 0.5, -1.2],
    [-0.75, 0.5, 2.2],
    [0.45, 0.5, -2.25],
  ];

  return (
    <>
      {trees.map((position, index) => (
        <group key={`${position.join('-')}-${index}`} position={position}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 0.55, 12]} />
            <meshPhysicalMaterial color="#b68d6a" {...softClayMaterial} />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.42, 16, 16]} />
            <meshPhysicalMaterial color="#27ae60" {...softClayMaterial} clearcoat={0.12} />
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
        <Float key={`${position.join('-')}-${index}`} speed={1.5 + index * 0.2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={position} castShadow>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.08}
              metalness={0.8}
              transmission={0.3}
              ior={1.5}
              thickness={0.5}
              clearcoat={0.75}
              emissive="#c39bd3"
              emissiveIntensity={0.38}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function CameraRig({ viewLevel, selectedBranch }: { viewLevel: ForUWorldViewLevel; selectedBranch: ForUBranchKey }) {
  const { camera } = useThree();
  const cameraTarget = useMemo(() => new Vector3(), []);
  const lookTarget = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const branchConfig = buildingConfigs.find((config) => config.branchKey === selectedBranch) ?? buildingConfigs[0];

    if (viewLevel === 'archipelago') {
      cameraTarget.set(15, 15, 15);
      lookTarget.set(0, 0.6, 0);
    } else if (viewLevel === 'exterior') {
      cameraTarget.set(branchConfig.position[0] + 5.8, 6.2, branchConfig.position[2] + 5.8);
      lookTarget.set(branchConfig.position[0], 1.15, branchConfig.position[2]);
    } else {
      cameraTarget.set(3, 2, 5);
      lookTarget.set(0, 0.95, 0);
    }

    camera.position.lerp(cameraTarget, 0.045);
    camera.lookAt(lookTarget);
  });

  return null;
}

function WorldScene({
  branchCounts,
  selectedBranch,
  viewLevel,
  tasks,
  onSelectBranch,
  onEnter,
  onExit,
}: {
  branchCounts: BranchCounts;
  selectedBranch: ForUBranchKey;
  viewLevel: ForUWorldViewLevel;
  tasks: ForUProjectNode[];
  onSelectBranch: (branchKey: ForUBranchKey) => void;
  onEnter: () => void;
  onExit: () => void;
}) {
  const selectedConfig = buildingConfigs.find((config) => config.branchKey === selectedBranch) ?? buildingConfigs[0];

  return (
    <>
      <CameraRig viewLevel={viewLevel} selectedBranch={selectedBranch} />
      <color attach="background" args={['#f5f0ff']} />
      <fog attach="fog" args={['#f5f0ff', 10, 25]} />
      <Environment preset="sunset" />
      <ambientLight intensity={0.42} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {viewLevel === 'interior' ? (
        <>
          <BuildingInterior branchKey={selectedBranch} tasks={tasks} />
          <Html position={[0, 2.65, -1.35]} center distanceFactor={5}>
            <button type="button" className="foru-world3d-level-button" onClick={onExit}>
              🔙 Salir
            </button>
          </Html>
        </>
      ) : (
        <>
          <Water />
          <Island onSelect={() => onSelectBranch(selectedBranch)} />
          {buildingConfigs.map((config) => (
            <BranchBuilding
              key={config.branchKey}
              config={config}
              count={branchCounts[config.branchKey]}
              viewLevel={viewLevel}
              isActive={config.branchKey === selectedBranch}
              onSelect={onSelectBranch}
              onEnter={onEnter}
            />
          ))}
          {viewLevel === 'exterior'
            ? tasks.slice(0, 8).map((task, index) => (
                <TaskProp
                  key={task.id}
                  node={task}
                  index={index}
                  viewLevel="exterior"
                  origin={selectedConfig.position}
                />
              ))
            : null}
          <Lighthouses />
          <Trees />
          <Pearls />
          <Sailboat />
          <ContactShadows position={[0, -0.34, 0]} opacity={0.34} scale={8.6} blur={2.4} far={5.8} color="#8d7ca6" />
        </>
      )}
      <OrbitControls
        enablePan={false}
        enabled={viewLevel !== 'interior'}
        minDistance={viewLevel === 'archipelago' ? 8 : 4}
        maxDistance={viewLevel === 'archipelago' ? 20 : 11}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
      />
      <EffectComposer>
        <N8AO intensity={0.32} aoRadius={2.2} distanceFalloff={1.25} />
        <Bloom intensity={0.16} luminanceThreshold={0.82} luminanceSmoothing={0.54} mipmapBlur />
        <Vignette offset={0.2} darkness={0.24} />
      </EffectComposer>
    </>
  );
}

export default function World3D({ onBackToMap }: World3DProps) {
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const focusedBranch = useActiveProjectsStore((state) => state.focusedBranch);
  const setFocusBranch = useActiveProjectsStore((state) => state.setFocusBranch);
  const viewLevel = useActiveProjectsStore((state) => state.viewLevel);
  const setViewLevel = useActiveProjectsStore((state) => state.setViewLevel);
  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;
  const selectedBranch = focusedBranch ?? 'marketing';

  const branchCounts = useMemo<BranchCounts>(() => {
    const counts: BranchCounts = {
      ideas: 0,
      actions: 0,
      finances: 0,
      marketing: 0,
      resources: 0,
    };

    activeProject?.nodes.forEach((node) => {
      if (node.role === 'free' && node.branchKey) {
        counts[node.branchKey] += 1;
      }
    });

    return counts;
  }, [activeProject?.nodes]);

  const selectedBranchTasks = useMemo(() => {
    return activeProject?.nodes.filter((node) => node.role === 'free' && node.branchKey === selectedBranch) ?? [];
  }, [activeProject?.nodes, selectedBranch]);

  function selectBranch(branchKey: ForUBranchKey) {
    setFocusBranch(branchKey);
    setViewLevel('exterior');
  }

  return (
    <section className="foru-world3d-shell" aria-label="Mundito 3D de proyectos">
      <button type="button" className="foru-world3d-back" onClick={onBackToMap}>
        Volver al Mapa
      </button>

      <Canvas shadows={{ type: PCFSoftShadowMap }} camera={{ position: [15, 15, 15], fov: 45 }} className="foru-world3d-canvas">
        <WorldScene
          branchCounts={branchCounts}
          selectedBranch={selectedBranch}
          viewLevel={viewLevel}
          tasks={selectedBranchTasks}
          onSelectBranch={selectBranch}
          onEnter={() => setViewLevel('interior')}
          onExit={() => setViewLevel('exterior')}
        />
      </Canvas>
    </section>
  );
}
