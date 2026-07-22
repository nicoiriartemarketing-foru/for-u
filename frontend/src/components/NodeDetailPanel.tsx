import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from '../lib/icons';
import { type ForUNodeKind, type ForUProjectNode, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

const nodeKindMeta: Record<ForUNodeKind, { label: string; icon: string; title: string }> = {
  center: { label: 'Proyecto', icon: '✨', title: 'Nucleo del proyecto' },
  branch: { label: 'Rama', icon: '✨', title: 'Rama base' },
  idea: { label: 'Idea', icon: '💡', title: 'Idea abierta' },
  task: { label: 'Accion', icon: '✅', title: 'Micro-accion' },
  resource: { label: 'Recurso', icon: '🔗', title: 'Recurso' },
  blocker: { label: 'Bloqueo', icon: '🧊', title: 'Bloqueo' },
  inspiration: { label: 'Inspiracion', icon: '✨', title: 'Inspiracion' },
};

function getActionButtons(node: ForUProjectNode) {
  if (node.role === 'branch') {
    return [
      {
        icon: '➕',
        label: 'Agregar nodo a esta rama',
        onClick: () => window.alert(`Agregando nodo a ${node.title}...`),
      },
      {
        icon: '👁️',
        label: 'Ver todos los nodos de esta rama',
        onClick: () => window.alert(`Mostrando nodos de ${node.title}...`),
      },
    ];
  }

  if (node.kind === 'task') {
    return [
      {
        icon: '🎨',
        label: 'Abrir plantilla en Canva',
        onClick: () => window.open('https://www.canva.com/', '_blank', 'noopener,noreferrer'),
      },
      {
        icon: '⏱️',
        label: 'Iniciar Pomodoro (20 min)',
        onClick: () => window.alert('Pomodoro iniciado ⏱️'),
      },
      {
        icon: '🤖',
        label: 'Consultar con IA',
        onClick: () => window.alert('IA pensando... 🧠'),
      },
    ];
  }

  if (node.kind === 'idea') {
    return [
      {
        icon: '💬',
        label: 'Desarrollar con IA',
        onClick: () => window.alert('IA desarrollando idea... 💡'),
      },
      {
        icon: '🔗',
        label: 'Convertir en Accion',
        onClick: () => window.alert('Convirtiendo idea en accion...'),
      },
    ];
  }

  if (node.kind === 'resource') {
    return [
      {
        icon: '🔗',
        label: 'Abrir enlace',
        onClick: () => window.alert('Abriendo recurso...'),
      },
      {
        icon: '📎',
        label: 'Agregar archivo',
        onClick: () => window.alert('Subiendo archivo...'),
      },
    ];
  }

  return [];
}

export default function NodeDetailPanel() {
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const selectedNodeId = useActiveProjectsStore((state) => state.selectedNodeId);
  const updateNode = useActiveProjectsStore((state) => state.updateNode);
  const deselectNode = useActiveProjectsStore((state) => state.deselectNode);

  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;
  const selectedNode = activeProject?.nodes.find((node) => node.id === selectedNodeId);
  const [draftDescription, setDraftDescription] = useState('');

  useEffect(() => {
    setDraftDescription(selectedNode?.description ?? '');
  }, [selectedNode?.description, selectedNode?.id]);

  useEffect(() => {
    if (!activeProjectId || !selectedNode || draftDescription === (selectedNode.description ?? '')) return;

    const timeoutId = window.setTimeout(() => {
      updateNode(activeProjectId, selectedNode.id, { description: draftDescription });
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [activeProjectId, draftDescription, selectedNode, updateNode]);

  if (!activeProjectId || !selectedNode) return null;

  const meta = selectedNode.role === 'branch'
    ? {
        label: selectedNode.title,
        icon: selectedNode.icon ?? nodeKindMeta.branch.icon,
        title: 'Rama base',
      }
    : nodeKindMeta[selectedNode.kind];
  const actionButtons = getActionButtons(selectedNode);

  return (
    <motion.aside
      className="foru-node-panel"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      aria-label="Detalles del nodo"
    >
      <header className="foru-node-panel-header">
        <div>
          <div className="foru-node-panel-icon" aria-hidden="true">{meta.icon}</div>
          <span className="foru-node-panel-badge">{meta.icon} {meta.label}</span>
          <h2>{selectedNode.title}</h2>
          <p>{meta.title}</p>
        </div>
        <button type="button" onClick={deselectNode} aria-label="Cerrar panel de detalles">
          <X size={18} />
        </button>
      </header>

      <label className="foru-node-panel-field">
        <span>Descripcion / notas</span>
        <textarea
          value={draftDescription}
          onChange={(event) => setDraftDescription(event.target.value)}
          onBlur={() => updateNode(activeProjectId, selectedNode.id, { description: draftDescription })}
          placeholder="Agrega más detalles..."
        />
      </label>

      <section className="foru-node-panel-actions" aria-label="Acciones rapidas del nodo">
        <span>Acciones rápidas</span>
        {actionButtons.length > 0 ? (
          <div>
            {actionButtons.map((action) => (
              <button key={action.label} type="button" onClick={action.onClick}>
                <span aria-hidden="true">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        ) : (
          <p>Selecciona o conecta nodos libres para activar herramientas especificas.</p>
        )}
      </section>
    </motion.aside>
  );
}
