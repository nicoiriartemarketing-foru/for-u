import { useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Html, OrbitControls } from '@react-three/drei';
import { PCFSoftShadowMap, Vector3 } from 'three';
import Island3D from './Island3D';
import Sailboat from './Sailboat';
import { type ForUActiveProject, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

type World3DProps = {
  onBackToMap: () => void;
  onOpenProject: (projectId: string) => void;
};

export default function World3D({ onBackToMap, onOpenProject }: World3DProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCameraUnlocked, setIsCameraUnlocked] = useState(false);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const activeProjectIds = useActiveProjectsStore((state) => state.activeProjectIds);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const switchProject = useActiveProjectsStore((state) => state.switchProject);

  const projects = useMemo(
    () => activeProjectIds
      .map((projectId) => projectsById[projectId])
      .filter((project): project is ForUActiveProject => Boolean(project) && project.status === 'active'),
    [activeProjectIds, projectsById],
  );
  const selectedId = selectedProjectId ?? activeProjectId ?? projects[0]?.id ?? null;

  function selectIsland(projectId: string) {
    setSelectedProjectId(projectId);
    switchProject(projectId);
    window.setTimeout(() => onOpenProject(projectId), 520);
  }

  return (
    <section className="foru-world3d-shell" aria-label="Archipiélago 3D de proyectos">
      <div className="foru-world-house-ui">
        <button type="button" onClick={onBackToMap}>← Volver al tablero</button>
        <button type="button" onClick={() => setIsCameraUnlocked((current) => !current)}>
          {isCameraUnlocked ? '🔒 Fijar vista' : '🕹️ Explorar'}
        </button>
      </div>

      <Canvas shadows={{ type: PCFSoftShadowMap }} camera={{ position: [0, 20, 30], fov: 45 }} className="foru-world3d-canvas">
        <ArchipelagoCamera selectedProjectId={selectedId} projects={projects} isCameraUnlocked={isCameraUnlocked} />
        <color attach="background" args={['#F8F2FF']} />
        <fog attach="fog" args={['#F8F2FF', 20, 58]} />
        <Environment preset="sunset" />
        <ambientLight intensity={0.58} />
        <directionalLight position={[6, 12, 8]} intensity={1.15} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />

        <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[34, 96]} />
          <meshPhysicalMaterial color="#76d7c4" transparent opacity={0.55} roughness={0.1} metalness={0.02} transmission={0.35} clearcoat={0.5} />
        </mesh>

        {projects.map((project, index) => (
          <Island3D
            key={project.id}
            project={project}
            position={getIslandPosition(index, projects.length)}
            isSelected={project.id === selectedId}
            onSelect={() => selectIsland(project.id)}
          >
            <ProjectBuildings project={project} />
            <Html position={[0, 5.2, 0]} center distanceFactor={14}>
              <button type="button" className="foru-world-room-action" onClick={() => selectIsland(project.id)}>
                Entrar al Kanban
              </button>
            </Html>
          </Island3D>
        ))}

        <Sailboat />
        <FloatingPearls />
        <ContactShadows position={[0, -0.35, 0]} opacity={0.32} scale={Math.max(18, projects.length * 8)} blur={2.6} far={14} color="#8d7ca6" />
        <OrbitControls enabled={isCameraUnlocked} enablePan={false} minDistance={12} maxDistance={46} maxPolarAngle={Math.PI / 2.35} />
      </Canvas>
    </section>
  );
}

function ArchipelagoCamera({
  selectedProjectId,
  projects,
  isCameraUnlocked,
}: {
  selectedProjectId: string | null;
  projects: ForUActiveProject[];
  isCameraUnlocked: boolean;
}) {
  const { camera } = useThree();
  const targetPosition = useMemo(() => new Vector3(0, 20, 30), []);
  const lookTarget = useMemo(() => new Vector3(0, 0, 0), []);

  useFrame(() => {
    if (isCameraUnlocked) return;
    const selectedIndex = projects.findIndex((project) => project.id === selectedProjectId);
    if (selectedIndex >= 0 && projects.length > 1) {
      const island = getIslandPosition(selectedIndex, projects.length);
      targetPosition.set(island[0] + 7, 8, island[2] + 9);
      lookTarget.set(island[0], 0.6, island[2]);
    } else {
      targetPosition.set(0, 20, 30);
      lookTarget.set(0, 0, 0);
    }

    camera.position.lerp(targetPosition, 0.06);
    camera.lookAt(lookTarget);
  });

  return null;
}

function ProjectBuildings({ project }: { project: ForUActiveProject }) {
  const freeNodes = project.nodes.filter((node) => node.role === 'free');
  const completedNodes = freeNodes.filter((node) => node.completedAt || node.taskStatus === 'done');
  const progress = freeNodes.length ? completedNodes.length / freeNodes.length : 0;
  const glow = progress >= 0.6;

  return (
    <group>
      <Float speed={1.2} rotationIntensity={0.04} floatIntensity={0.12}>
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[1.25 + progress * 0.45, 1.45 + progress * 0.75, 1.15]} />
          <meshPhysicalMaterial color={progress > 0 ? '#FFD1DC' : '#d5d5d5'} roughness={0.78} metalness={0.06} clearcoat={0.25} />
        </mesh>
        <mesh position={[0, 2.05 + progress * 0.34, 0]} castShadow>
          <coneGeometry args={[0.98, 0.62, 4]} />
          <meshPhysicalMaterial color="#FFDAB9" roughness={0.72} metalness={0.06} clearcoat={0.22} />
        </mesh>
      </Float>
      <mesh position={[-1.65, 0.58, 1.25]} castShadow>
        <sphereGeometry args={[0.38, 18, 12]} />
        <meshPhysicalMaterial color="#B5EAD7" roughness={0.84} metalness={0.03} />
      </mesh>
      <mesh position={[1.55, 0.58, -1.15]} castShadow>
        <sphereGeometry args={[0.34, 18, 12]} />
        <meshPhysicalMaterial color="#B5EAD7" roughness={0.84} metalness={0.03} />
      </mesh>
      {glow ? <pointLight position={[0, 3.2, 0]} color="#FFDAB9" distance={5} intensity={1.05} /> : null}
    </group>
  );
}

function FloatingPearls() {
  const pearls: Array<[number, number, number]> = [
    [0, 4.2, 0],
    [7, 3.4, -5],
    [-8, 3.1, 6],
    [4, 3.8, 9],
  ];

  return (
    <>
      {pearls.map((position, index) => (
        <Float key={position.join('-')} speed={1.2 + index * 0.16} rotationIntensity={0.4} floatIntensity={0.45}>
          <mesh position={position} castShadow>
            <sphereGeometry args={[0.28, 24, 18]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.08} metalness={0.72} transmission={0.28} clearcoat={0.8} emissive="#E6E6FA" emissiveIntensity={0.24} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function getIslandPosition(index: number, total: number): [number, number, number] {
  if (total <= 1) return [0, 0, 0];
  const angle = (index / total) * Math.PI * 2;
  const radius = total <= 5 ? 12 : 15 + Math.floor(index / 8) * 5;
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
}
