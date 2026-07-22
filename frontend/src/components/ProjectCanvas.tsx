import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type NodeMouseHandler,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import BranchNode, { type BranchNodeData } from './BranchNode';
import CenterNode, { type CenterNodeData } from './CenterNode';
import IdeaNode, { type IdeaNodeData } from './IdeaNode';
import { Plus } from '../lib/icons';
import {
  baseBranches,
  getCenterNodeId,
  type ForUNodeKind,
  type ForUProjectNode,
  useActiveProjectsStore,
} from '../stores/useActiveProjectsStore';

const nodeTypes: NodeTypes = {
  centerNode: CenterNode,
  branchNode: BranchNode,
  ideaNode: IdeaNode,
};

const addOptions: Array<{ kind: ForUNodeKind; label: string; title: string }> = [
  { kind: 'idea', label: '💡 Idea', title: 'Nueva idea' },
  { kind: 'task', label: '✅ Acción', title: 'Nueva microaccion' },
  { kind: 'resource', label: '🔗 Recurso', title: 'Nuevo recurso' },
];

type ForUCanvasNodeData = IdeaNodeData | BranchNodeData | CenterNodeData;

function toFlowNode(node: ForUProjectNode): Node<ForUCanvasNodeData> {
  if (node.role === 'center') {
    return {
      id: node.id,
      type: 'centerNode',
      position: { x: node.x, y: node.y },
      draggable: false,
      deletable: false,
      data: {
        title: node.title,
        icon: node.icon,
      },
    };
  }

  if (node.role === 'branch') {
    const branch = baseBranches.find((item) => item.key === node.branchKey);

    return {
      id: node.id,
      type: 'branchNode',
      position: { x: node.x, y: node.y },
      draggable: false,
      deletable: false,
      data: {
        title: node.title,
        icon: node.icon,
        branchKey: node.branchKey,
        color: branch?.color,
      },
    };
  }

  return {
    id: node.id,
    type: 'ideaNode',
    position: { x: node.x, y: node.y },
    draggable: true,
    data: {
      title: node.title,
      kind: node.kind,
      icon: node.icon,
    },
  };
}

export default function ProjectCanvas() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{ kind: ForUNodeKind; title: string } | null>(null);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const addFreeNodeToBranch = useActiveProjectsStore((state) => state.addFreeNodeToBranch);
  const moveNode = useActiveProjectsStore((state) => state.moveNode);
  const connectNodes = useActiveProjectsStore((state) => state.connectNodes);
  const removeEdge = useActiveProjectsStore((state) => state.removeEdge);
  const selectNode = useActiveProjectsStore((state) => state.selectNode);
  const deselectNode = useActiveProjectsStore((state) => state.deselectNode);
  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;

  useEffect(() => {
    setSelectedOption(null);
  }, [activeProjectId]);

  const nodes = useMemo<Node<ForUCanvasNodeData>[]>(() => {
    return activeProject?.nodes?.map(toFlowNode) ?? [];
  }, [activeProject?.nodes]);

  const edges = useMemo<Edge[]>(() => {
    const centerNodeId = activeProject ? getCenterNodeId(activeProject.id) : '';

    return (activeProject?.edges ?? []).map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'default',
      animated: edge.source === centerNodeId,
      style: edge.source === centerNodeId
        ? { stroke: '#C39BD3', strokeWidth: 3, strokeDasharray: '8 8' }
        : { stroke: '#A8A1B5', strokeWidth: 2 },
    }));
  }, [activeProject]);

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

  const handleNodeClick = useCallback<NodeMouseHandler>((_event, node) => {
    selectNode(node.id);
  }, [selectNode]);

  function createNode(branchKey: typeof baseBranches[number]['key']) {
    if (!activeProjectId || !selectedOption) return;

    const branch = baseBranches.find((item) => item.key === branchKey);
    const freeNodeCount = activeProject?.nodes?.filter((node) => node.role === 'free' && node.branchKey === branchKey).length ?? 0;
    const angle = freeNodeCount * 0.45;
    const direction = branch ? Math.atan2(branch.y - 400, branch.x - 500) : 0;
    const distance = 210 + freeNodeCount * 26;

    addFreeNodeToBranch(activeProjectId, branchKey, {
      title: selectedOption.title,
      kind: selectedOption.kind,
      icon: selectedOption.kind === 'idea' ? '💡' : selectedOption.kind === 'task' ? '✅' : '🔗',
      x: Math.round(500 + Math.cos(direction + angle) * distance),
      y: Math.round(400 + Math.sin(direction + angle) * distance),
    });

    setSelectedOption(null);
    setIsMenuOpen(false);
  }

  return (
    <section className="foru-canvas-shell" aria-label="Lienzo radial del proyecto">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={deselectNode}
        onConnect={handleConnect}
        onEdgesDelete={handleEdgesDelete}
        fitView
        fitViewOptions={{ padding: 0.28 }}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick
        deleteKeyCode={['Backspace', 'Delete']}
        defaultEdgeOptions={{ type: 'default' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1.2} color="#ddd6ea" />
        <MiniMap pannable zoomable nodeColor="#c39bd3" maskColor="rgba(250, 247, 255, 0.68)" />
        <Controls showInteractive={false} />
      </ReactFlow>

      <div className="foru-canvas-add">
        {selectedOption ? (
          <div className="foru-canvas-add-menu foru-canvas-branch-picker">
            <strong>¿Conectar a qué rama?</strong>
            {baseBranches.map((branch) => (
              <button
                key={branch.key}
                type="button"
                onClick={() => createNode(branch.key)}
              >
                {branch.icon} {branch.title}
              </button>
            ))}
            <button type="button" onClick={() => setSelectedOption(null)}>
              Cancelar
            </button>
          </div>
        ) : isMenuOpen ? (
          <div className="foru-canvas-add-menu">
            {addOptions.map((option) => (
              <button
                key={option.kind}
                type="button"
                onClick={() => setSelectedOption({ kind: option.kind, title: option.title })}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          className="foru-canvas-add-button"
          onClick={() => {
            setSelectedOption(null);
            setIsMenuOpen((current) => !current);
          }}
          aria-label="Agregar nodo al canvas"
        >
          <Plus size={22} />
        </button>
      </div>
    </section>
  );
}
