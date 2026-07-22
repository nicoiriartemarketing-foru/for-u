import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import IdeaNode, { type IdeaNodeData } from './IdeaNode';
import { Plus, Sparkles } from '../lib/icons';
import {
  type ForUNodeKind,
  type ForUProjectNode,
  useActiveProjectsStore,
} from '../stores/useActiveProjectsStore';

const nodeTypes: NodeTypes = {
  ideaNode: IdeaNode,
};

const addOptions: Array<{ kind: ForUNodeKind; label: string; title: string }> = [
  { kind: 'idea', label: '💡 Idea', title: 'Nueva idea' },
  { kind: 'task', label: '✅ Acción', title: 'Nueva microaccion' },
  { kind: 'resource', label: '🔗 Recurso', title: 'Nuevo recurso' },
];

function toFlowNode(node: ForUProjectNode): Node<IdeaNodeData> {
  return {
    id: node.id,
    type: 'ideaNode',
    position: { x: node.x, y: node.y },
    data: {
      title: node.title,
      kind: node.kind,
      icon: node.icon,
    },
  };
}

export default function ProjectCanvas() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const addNode = useActiveProjectsStore((state) => state.addNode);
  const moveNode = useActiveProjectsStore((state) => state.moveNode);
  const connectNodes = useActiveProjectsStore((state) => state.connectNodes);
  const removeEdge = useActiveProjectsStore((state) => state.removeEdge);
  const openIdeaJar = useActiveProjectsStore((state) => state.openIdeaJar);

  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;

  const nodes = useMemo<Node<IdeaNodeData>[]>(() => {
    return activeProject?.nodes?.map(toFlowNode) ?? [];
  }, [activeProject?.nodes]);

  const edges = useMemo<Edge[]>(() => {
    return (activeProject?.edges ?? []).map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#c39bd3', strokeWidth: 2 },
    }));
  }, [activeProject?.edges]);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    if (!activeProjectId) return;

    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        moveNode(activeProjectId, change.id, change.position);
      }
    });
  }, [activeProjectId, moveNode]);

  const handleConnect = useCallback((connection: Connection) => {
    if (!activeProjectId || !connection.source || !connection.target) return;
    connectNodes(activeProjectId, connection.source, connection.target);
  }, [activeProjectId, connectNodes]);

  const handleEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    if (!activeProjectId) return;
    deletedEdges.forEach((edge) => removeEdge(activeProjectId, edge.id));
  }, [activeProjectId, removeEdge]);

  function createNode(kind: ForUNodeKind, title: string) {
    if (!activeProjectId) return;

    const offset = (activeProject?.nodes?.length ?? 0) * 18;
    addNode(activeProjectId, {
      title,
      kind,
      icon: kind === 'idea' ? '💡' : kind === 'task' ? '✅' : '🔗',
      x: 260 + offset,
      y: 180 + offset,
    });
    setIsMenuOpen(false);
  }

  function createDemoMap() {
    if (!activeProjectId) return;

    const demoNodes: Array<{ kind: ForUNodeKind; title: string; icon: string; x: number; y: number }> = [
      { kind: 'idea', title: 'Idea central: campaña FOR U', icon: '💡', x: 320, y: 180 },
      { kind: 'task', title: '15 min: escribir 3 posts posibles', icon: '✅', x: 80, y: 70 },
      { kind: 'resource', title: 'Recurso: abrir plantilla en Canva', icon: '🔗', x: 590, y: 70 },
      { kind: 'task', title: '15 min: elegir una oferta simple', icon: '✅', x: 100, y: 330 },
      { kind: 'idea', title: 'Idea: versión express para clientas', icon: '✨', x: 580, y: 330 },
    ];

    const createdIds = demoNodes
      .map((node) => addNode(activeProjectId, node))
      .filter((nodeId): nodeId is string => Boolean(nodeId));

    const [centerId, ...satelliteIds] = createdIds;
    satelliteIds.forEach((nodeId) => connectNodes(activeProjectId, centerId, nodeId));
  }

  return (
    <section className="foru-canvas-shell" aria-label="Lienzo radial del proyecto">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onConnect={handleConnect}
        onEdgesDelete={handleEdgesDelete}
        fitView
        fitViewOptions={{ padding: 0.28 }}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick
        deleteKeyCode={['Backspace', 'Delete']}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1.2} color="#d9d2e8" />
        <MiniMap pannable zoomable nodeColor="#c39bd3" maskColor="rgba(250, 247, 255, 0.68)" />
        <Controls showInteractive={false} />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="foru-canvas-empty">
          <div className="foru-canvas-empty-orbit" aria-hidden="true">
            <span>💡</span>
            <span>✅</span>
            <span>🔗</span>
          </div>
          <span>Tu mapa está esperando ideas</span>
          <p>Prueba el Frasco con notas caóticas o genera un mapa demo para ver cómo se siente.</p>
          <div className="foru-canvas-empty-actions">
            <button type="button" onClick={openIdeaJar}>
              <Sparkles size={17} /> Abrir Frasco
            </button>
            <button type="button" onClick={createDemoMap}>
              Crear demo
            </button>
          </div>
        </div>
      )}

      <div className="foru-canvas-add">
        {isMenuOpen && (
          <div className="foru-canvas-add-menu">
            {addOptions.map((option) => (
              <button
                key={option.kind}
                type="button"
                onClick={() => createNode(option.kind, option.title)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          className="foru-canvas-add-button"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-label="Agregar nodo al canvas"
        >
          <Plus size={22} />
        </button>
      </div>
    </section>
  );
}
