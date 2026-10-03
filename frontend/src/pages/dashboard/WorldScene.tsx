import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import Island3D from '../../components/Island3D';
import Sailboat from '../../components/Sailboat';
import MascotGuide from '../../components/MascotGuide';
import type { ForUActiveProject } from '../../stores/useActiveProjectsStore';
import { areaDefinitions, type AreaId } from './areaModel';
type Props = { projects: ForUActiveProject[]; activeId: string; onSelect: (id: string) => void; onArea: (area: AreaId) => void; reduced: boolean; visible: boolean; onFailure: () => void; zoom: number };
function FrameWatchdog({ onFailure }: { onFailure: () => void }) {
  const painted = useRef(false);
  useFrame(() => { painted.current = true; });
  useEffect(() => {
    const timer = window.setTimeout(() => { if (!painted.current) onFailure(); }, 5000);
    return () => window.clearTimeout(timer);
  }, [onFailure]);
  return null;
}
function CameraTravel({ x, reduced, zoom }: { x: number; reduced: boolean; zoom: number }) {
  const destination = useRef(new Vector3());
  useFrame(({ camera }, delta) => { destination.current.set(x + 8, 16, 19); if (reduced) camera.position.copy(destination.current); else camera.position.lerp(destination.current, 1 - Math.exp(-delta * 4)); camera.lookAt(camera.position.x - 8, 0, 0); if (camera.zoom !== zoom) { camera.zoom = zoom; camera.updateProjectionMatrix(); } });
  return null;
}
export default function WorldScene({ projects, activeId, onSelect, onArea, reduced, visible, onFailure, zoom }: Props) {
  const index = Math.max(0, projects.findIndex(p => p.id === activeId));
  return <div className="world-canvas" role="group" aria-label="Archipiélago 3D. Usa los botones de islas y espacios para navegar con teclado."><Canvas orthographic camera={{ position: [8, 16, 19], zoom, near: 0.1, far: 400 }} dpr={[1, 1.5]} frameloop={visible && !reduced ? 'always' : 'demand'} gl={{ antialias: false, powerPreference: 'low-power' }} onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); onFailure(); }, { once: true }); }}>
    <FrameWatchdog onFailure={onFailure} /><color attach="background" args={['#c9eced']} /><ambientLight intensity={1.8} /><directionalLight position={[6, 12, 8]} intensity={2} /><CameraTravel x={index * 12} reduced={reduced || !visible} zoom={zoom} />
    <mesh position={[index * 12, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[150, 100]} /><meshStandardMaterial color="#76c9d6" roughness={1} /></mesh>
    {projects.map((p, i) => Math.abs(i - index) <= 2 && <Island3D key={p.id} project={p} position={[i * 12, 0, 0]} isSelected={p.id === activeId} onSelect={() => onSelect(p.id)} animated={!reduced && visible} subtitle="Tu proyecto · cuatro espacios">
      {areaDefinitions.map((a, j) => <group key={a.id} position={[(j % 2 ? 1 : -1) * 1.35, 0.7, (j < 2 ? -1 : 1) * 1.3]} onClick={event => { event.stopPropagation(); onSelect(p.id); onArea(a.id); }}><mesh position={[0, 0.55, 0]}><boxGeometry args={[1.25, 1.4, 1.15]} /><meshStandardMaterial color={a.color} roughness={0.85} /></mesh><mesh position={[0, 1.45, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[1, 0.75, 4]} /><meshStandardMaterial color="#fff3da" /></mesh>{p.id === activeId && <Html position={[0, 2.05, 0]} center><button className="world-tower-label" onClick={() => onArea(a.id)}>{a.title}</button></Html>}</group>)}
      {p.id === activeId && <MascotGuide fixedLabel message="" animated={!reduced && visible} />}
    </Island3D>)}
    <Sailboat destination={[index * 12, -0.6, 5]} reduced={reduced || !visible} />
  </Canvas></div>;
}
