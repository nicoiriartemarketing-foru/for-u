import { Html } from '@react-three/drei';
import type { ForUProjectNode } from '../stores/useActiveProjectsStore';

type RoomActionsProps = {
  tasks: ForUProjectNode[];
  onCompleteTask: (nodeId: string) => void;
};

export default function RoomActions({ tasks, onCompleteTask }: RoomActionsProps) {
  return (
    <group position={[0, 0, -5.3]}>
      <RoomBase color="#B5EAD7" />
      <mesh position={[0, 0.55, -0.42]} castShadow>
        <boxGeometry args={[1.7, 0.24, 0.82]} />
        <meshPhysicalMaterial color="#FFDAB9" roughness={0.78} metalness={0.03} clearcoat={0.16} />
      </mesh>
      <mesh position={[0, 0.92, -0.9]} castShadow>
        <boxGeometry args={[2.3, 1.05, 0.08]} />
        <meshPhysicalMaterial color="#FAFAFA" roughness={0.88} metalness={0.02} />
      </mesh>
      {tasks.slice(0, 9).map((task, index) => (
        <group
          key={task.id}
          position={[-0.78 + (index % 3) * 0.78, 1.1 + Math.floor(index / 3) * 0.34, -0.84]}
          onClick={(event) => {
            event.stopPropagation();
            onCompleteTask(task.id);
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[0.52, 0.28, 0.035]} />
            <meshPhysicalMaterial color={task.priority === 'high' ? '#FFD1DC' : task.priority === 'medium' ? '#FFDAB9' : '#E6E6FA'} roughness={0.78} metalness={0.02} />
          </mesh>
          <Html position={[0, 0.24, 0]} center distanceFactor={6}>
            <button type="button" className="foru-world-room-chip">{task.title.slice(0, 24)}</button>
          </Html>
        </group>
      ))}
      <PomodoroDesk />
    </group>
  );
}

function RoomBase({ color }: { color: string }) {
  return (
    <>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[3.8, 0.08, 2.7]} />
        <meshPhysicalMaterial color={color} roughness={0.86} metalness={0.02} clearcoat={0.08} />
      </mesh>
      <mesh position={[0, 1.12, -1.36]} receiveShadow>
        <boxGeometry args={[3.8, 2.16, 0.08]} />
        <meshPhysicalMaterial color="#FAFAFA" roughness={0.9} metalness={0.02} />
      </mesh>
    </>
  );
}

function PomodoroDesk() {
  return (
    <Html position={[1.05, 0.9, -0.25]} center distanceFactor={6}>
      <button type="button" className="foru-world-room-action" onClick={() => window.alert('Pomodoro iniciado: 15 minutos, Nicole.')}>
        Pomodoro
      </button>
    </Html>
  );
}
