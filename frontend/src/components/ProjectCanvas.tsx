import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import toast from 'react-hot-toast';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type NodeDragHandler,
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
  type ForUBranchKey,
  type ForUProjectNode,
  type ForURouteStep,
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

function getFocusOpacity(node: ForUProjectNode, focusedBranch: ForUBranchKey | null) {
  if (!focusedBranch) return 1;
  if (node.branchKey === focusedBranch) return 1;

  return 0.2;
}

function toFlowNode(node: ForUProjectNode, focusedBranch: ForUBranchKey | null, nextActionIds: Set<string>, routeStepByNodeId: Map<string, number>): Node<ForUCanvasNodeData> {
  const opacity = getFocusOpacity(node, focusedBranch);
  const style: CSSProperties = {
    opacity,
    transition: 'opacity 0.3s ease',
    pointerEvents: opacity < 1 ? 'none' : 'auto',
  };

  if (node.role === 'center') {
    return {
      id: node.id,
      type: 'centerNode',
      position: { x: node.x, y: node.y },
      draggable: false,
      deletable: false,
      style,
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
      style,
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
    style,
    data: {
      title: node.title,
      kind: node.kind,
      icon: node.icon,
      priority: node.priority,
      isNextAction: nextActionIds.has(node.id),
      routeStepNumber: routeStepByNodeId.get(node.id),
    },
  };
}

export default function ProjectCanvas() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{ kind: ForUNodeKind; title: string } | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const addFreeNodeToBranch = useActiveProjectsStore((state) => state.addFreeNodeToBranch);
  const moveNode = useActiveProjectsStore((state) => state.moveNode);
  const connectNodes = useActiveProjectsStore((state) => state.connectNodes);
  const removeEdge = useActiveProjectsStore((state) => state.removeEdge);
  const selectNode = useActiveProjectsStore((state) => state.selectNode);
  const deselectNode = useActiveProjectsStore((state) => state.deselectNode);
  const focusedBranch = useActiveProjectsStore((state) => state.focusedBranch);
  const reassignNodeBranch = useActiveProjectsStore((state) => state.reassignNodeBranch);
  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;
  const routeStepByNodeId = useMemo(() => {
    return new Map((activeProject?.digitalRoute ?? []).map((step, index) => [step.linkedNodeId, index + 1]));
  }, [activeProject?.digitalRoute]);
  const nextActionIds = useMemo(() => {
    return getNextActionIds(activeProject?.nodes ?? []);
  }, [activeProject?.nodes]);

  const branchCounts = useMemo(() => {
    return Object.fromEntries(baseBranches.map((branch) => [
      branch.key,
      activeProject?.nodes.filter((node) => node.role === 'free' && node.branchKey === branch.key).length ?? 0,
    ])) as Record<ForUBranchKey, number>;
  }, [activeProject?.nodes]);

  useEffect(() => {
    setSelectedOption(null);
  }, [activeProjectId]);

  useEffect(() => {
    if (!activeProjectId) return;

    const guideKey = `foru-project-guide-seen-${activeProjectId}`;
    if (window.localStorage.getItem(guideKey)) return;

    setIsGuideOpen(true);
    window.localStorage.setItem(guideKey, 'true');
  }, [activeProjectId]);

  const nodes = useMemo<Node<ForUCanvasNodeData>[]>(() => {
    return activeProject?.nodes?.map((node) => toFlowNode(node, focusedBranch, nextActionIds, routeStepByNodeId)) ?? [];
  }, [activeProject?.nodes, focusedBranch, nextActionIds, routeStepByNodeId]);

  const edges = useMemo<Edge[]>(() => {
    const centerNodeId = activeProject ? getCenterNodeId(activeProject.id) : '';

    const projectEdges = (activeProject?.edges ?? []).map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'default',
      animated: edge.source === centerNodeId,
      markerEnd: undefined,
      style: edge.source === centerNodeId
        ? { stroke: getEdgeColor(edge.source, edge.target, activeProject.nodes), strokeWidth: 3, strokeDasharray: '8 8', opacity: getEdgeOpacity(edge.source, edge.target, activeProject.nodes, focusedBranch) }
        : { stroke: getEdgeColor(edge.source, edge.target, activeProject?.nodes ?? []), strokeWidth: 2, opacity: getEdgeOpacity(edge.source, edge.target, activeProject?.nodes ?? [], focusedBranch), transition: 'opacity 0.3s ease' },
    }));

    const routeEdges = getRouteEdges(activeProject?.digitalRoute ?? []);
    return [...projectEdges, ...routeEdges];
  }, [activeProject, focusedBranch]);

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

  const handleNodeDragStop = useCallback<NodeDragHandler>((_event, node) => {
    if (!activeProjectId || !activeProject) return;

    const projectNode = activeProject.nodes.find((item) => item.id === node.id);
    if (!projectNode || projectNode.locked || projectNode.role !== 'free') return;

    const nearestBranch = getNearestBranch(node.position.x, node.position.y);
    if (!nearestBranch || nearestBranch.key === projectNode.branchKey) return;

    reassignNodeBranch(activeProjectId, projectNode.id, nearestBranch.key);
    toast.success(`Movido a ${nearestBranch.title}`);
  }, [activeProject, activeProjectId, reassignNodeBranch]);

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
        onNodeDragStop={handleNodeDragStop}
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

      <div className="foru-canvas-legend" aria-label="Leyenda de areas del proyecto">
        {baseBranches.map((branch) => (
          <span key={branch.key} style={{ '--branch-color': branch.color } as CSSProperties}>
            {branch.icon} {branch.title} · {branchCounts[branch.key]}
          </span>
        ))}
      </div>

      <button type="button" className="foru-canvas-help" onClick={() => setIsGuideOpen(true)} aria-label="Mostrar guia del mapa">
        ?
      </button>

      {isGuideOpen ? (
        <div className="foru-project-guide" role="dialog" aria-modal="true" aria-label="Guia del mapa mental">
          <div className="foru-project-guide-card">
            <span>Guía rápida</span>
            <h2>Así se ordena tu proyecto</h2>
            <div className="foru-project-guide-grid">
              <p><strong>💡 Ideas</strong> Aquí van tus ideas sueltas, chispazos y posibilidades.</p>
              <p><strong>✅ Acciones</strong> Aquí aterrizan las tareas concretas para ejecutar.</p>
              <p><strong>💰 Finanzas</strong> Finanzas, presupuesto, precios y números.</p>
              <p><strong>📱 Marketing</strong> Contenido, campañas, redes y promoción.</p>
              <p><strong>📚 Recursos</strong> Links, archivos, plantillas y material útil.</p>
            </div>
            <button type="button" onClick={() => setIsGuideOpen(false)}>
              Entendido, comenzar
            </button>
          </div>
        </div>
      ) : null}

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

function getNearestBranch(x: number, y: number) {
  const nearest = baseBranches
    .map((branch) => ({
      ...branch,
      distance: Math.hypot(branch.x - x, branch.y - y),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  return nearest && nearest.distance < 260 ? nearest : null;
}

function getEdgeOpacity(source: string, target: string, nodes: ForUProjectNode[], focusedBranch: ForUBranchKey | null) {
  if (!focusedBranch) return 1;

  const sourceNode = nodes.find((node) => node.id === source);
  const targetNode = nodes.find((node) => node.id === target);

  return sourceNode?.branchKey === focusedBranch || targetNode?.branchKey === focusedBranch ? 1 : 0.18;
}

function getEdgeColor(source: string, target: string, nodes: ForUProjectNode[]) {
  const sourceNode = nodes.find((node) => node.id === source);
  const targetNode = nodes.find((node) => node.id === target);
  const branchKey = targetNode?.branchKey ?? sourceNode?.branchKey;
  const branch = baseBranches.find((item) => item.key === branchKey);

  return branch?.color ?? '#A8A1B5';
}

function getNextActionIds(nodes: ForUProjectNode[]) {
  const priorityScore = { high: 0, medium: 1, low: 2 } as const;
  const ids = new Set<string>();

  baseBranches.forEach((branch) => {
    nodes
      .filter((node) => node.role === 'free' && node.branchKey === branch.key && !node.completedAt)
      .sort((a, b) => {
        const priorityDelta = priorityScore[a.priority ?? 'low'] - priorityScore[b.priority ?? 'low'];
        if (priorityDelta !== 0) return priorityDelta;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
      .slice(0, 3)
      .forEach((node) => ids.add(node.id));
  });

  return ids;
}

function getRouteEdges(route: ForURouteStep[]): Edge[] {
  return route.slice(0, -1).map((step, index) => {
    const nextStep = route[index + 1];

    return {
      id: `digital-route-${step.id}-${nextStep.id}`,
      source: step.linkedNodeId,
      target: nextStep.linkedNodeId,
      type: 'smoothstep',
      animated: true,
      selectable: false,
      deletable: false,
      style: {
        stroke: '#F4B400',
        strokeWidth: 5,
        filter: 'drop-shadow(0 0 8px rgba(244, 180, 0, 0.55))',
      },
    };
  });
}
