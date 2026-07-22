import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ForUProjectStatus = 'active' | 'paused' | 'blocked' | 'completed';
export type ForUTaskStatus = 'todo' | 'doing' | 'done';
export type ForUNodeKind = 'center' | 'branch' | 'idea' | 'task' | 'resource' | 'blocker' | 'inspiration';
export type ForUNodeRole = 'center' | 'branch' | 'free';
export type ForUBranchKey = 'ideas' | 'actions' | 'finances' | 'marketing' | 'resources';
export type ForUNodePriority = 'high' | 'medium' | 'low';
export type ForURawNoteKind = 'text' | 'audio' | 'photo';
export type ForUWorldViewLevel = 'archipelago' | 'exterior' | 'interior';

export type ForUTask = {
  id: string;
  title: string;
  status: ForUTaskStatus;
  createdAt: string;
  completedAt?: string;
};

export type ForUProjectNode = {
  id: string;
  title: string;
  kind: ForUNodeKind;
  role?: ForUNodeRole;
  branchKey?: ForUBranchKey;
  x: number;
  y: number;
  icon?: string;
  description?: string;
  priority?: ForUNodePriority;
  subtasks?: string[];
  reasoning?: string;
  parentNodeId?: string;
  locked?: boolean;
  linkedTaskId?: string;
  externalUrl?: string;
  createdAt: string;
};

export type ForUProjectEdge = {
  id: string;
  source: string;
  target: string;
  createdAt: string;
};

export type ForUActiveProject = {
  id: string;
  name: string;
  status: ForUProjectStatus;
  tasks: ForUTask[];
  nodes: ForUProjectNode[];
  edges: ForUProjectEdge[];
  createdAt: string;
  updatedAt: string;
};

export type ForURawNote = {
  id: string;
  projectId: string | null;
  kind: ForURawNoteKind;
  content: string;
  previewUrl?: string;
  createdAt: string;
  processedAt?: string;
};

type CreateProjectInput = {
  name: string;
  status?: ForUProjectStatus;
};

type CreateRawNoteInput = {
  projectId?: string | null;
  kind: ForURawNoteKind;
  content: string;
  previewUrl?: string;
};

export type CreateFreeNodeForBranchInput = Omit<ForUProjectNode, 'id' | 'createdAt' | 'role'> & {
  branchKey: ForUBranchKey;
};

type ActiveProjectsState = {
  activeProjectIds: string[];
  activeProjectId: string | null;
  projectsById: Record<string, ForUActiveProject>;
  rawNotes: ForURawNote[];
  isJarOpen: boolean;
  selectedNodeId: string | null;
  focusedBranch: ForUBranchKey | null;
  viewLevel: ForUWorldViewLevel;
  openProject: (input: CreateProjectInput) => string;
  focusProject: (projectId: string) => void;
  closeProject: (projectId: string) => void;
  renameProject: (projectId: string, name: string) => void;
  updateProjectStatus: (projectId: string, status: ForUProjectStatus) => void;
  addTask: (projectId: string, title: string) => string | null;
  updateTaskStatus: (projectId: string, taskId: string, status: ForUTaskStatus) => void;
  addNode: (projectId: string, node: Omit<ForUProjectNode, 'id' | 'createdAt'>) => string | null;
  addFreeNodeToBranch: (projectId: string, branchKey: ForUBranchKey, node: Omit<ForUProjectNode, 'id' | 'createdAt' | 'role'>) => string | null;
  addFreeNodesToBranches: (projectId: string, nodes: CreateFreeNodeForBranchInput[]) => string[];
  updateNode: (projectId: string, nodeId: string, patch: Partial<Omit<ForUProjectNode, 'id'>>) => void;
  reassignNodeBranch: (projectId: string, nodeId: string, branchKey: ForUBranchKey) => void;
  splitNodeIntoSubtasks: (projectId: string, nodeId: string, subtasks: string[]) => string[];
  moveNode: (projectId: string, nodeId: string, position: { x: number; y: number }) => void;
  connectNodes: (projectId: string, source: string, target: string) => string | null;
  removeEdge: (projectId: string, edgeId: string) => void;
  selectNode: (nodeId: string) => void;
  deselectNode: () => void;
  setFocusBranch: (branchKey: ForUBranchKey) => void;
  clearFocus: () => void;
  setViewLevel: (level: ForUWorldViewLevel) => void;
  toggleView: () => void;
  openIdeaJar: () => void;
  closeIdeaJar: () => void;
  toggleIdeaJar: () => void;
  addRawNote: (input: CreateRawNoteInput) => string;
  markRawNoteProcessed: (noteId: string) => void;
  clearRawNotes: () => void;
  resetWorkspace: () => void;
};

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function now() {
  return new Date().toISOString();
}

function createProject(input: CreateProjectInput): ForUActiveProject {
  const timestamp = now();
  const projectId = createId('project');
  const name = input.name.trim() || 'Proyecto sin nombre';
  const base = createBaseMap(projectId, name, timestamp);

  return {
    id: projectId,
    name,
    status: input.status ?? 'active',
    tasks: [],
    nodes: base.nodes,
    edges: base.edges,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function touch(project: ForUActiveProject): ForUActiveProject {
  return { ...project, updatedAt: now() };
}

function normalizeProject(project: ForUActiveProject): ForUActiveProject {
  const timestamp = now();
  const base = createBaseMap(project.id, project.name, timestamp);
  const nodes = project.nodes ?? [];
  const edges = project.edges ?? [];
  const missingBaseNodes = base.nodes.filter((baseNode) => !nodes.some((node) => node.id === baseNode.id));
  const missingBaseEdges = base.edges.filter((baseEdge) => !edges.some((edge) => edge.id === baseEdge.id));

  return {
    ...project,
    tasks: project.tasks ?? [],
    nodes: [...missingBaseNodes, ...nodes],
    edges: [...missingBaseEdges, ...edges],
  };
}

export const baseBranches: Array<{
  key: ForUBranchKey;
  title: string;
  icon: string;
  x: number;
  y: number;
  color: string;
}> = [
  { key: 'ideas', title: 'Ideas', icon: '💡', x: 240, y: 210, color: '#FDE68A' },
  { key: 'actions', title: 'Acciones', icon: '✅', x: 760, y: 210, color: '#6EE7B7' },
  { key: 'finances', title: 'Finanzas', icon: '💰', x: 830, y: 400, color: '#93C5FD' },
  { key: 'marketing', title: 'Marketing', icon: '📱', x: 760, y: 590, color: '#C39BD3' },
  { key: 'resources', title: 'Recursos', icon: '🎨', x: 240, y: 590, color: '#76D7C4' },
];

export function getCenterNodeId(projectId: string) {
  return `${projectId}-center`;
}

export function getBranchNodeId(projectId: string, branchKey: ForUBranchKey) {
  return `${projectId}-branch-${branchKey}`;
}

function createBaseMap(projectId: string, projectName: string, timestamp: string) {
  const centerNode: ForUProjectNode = {
    id: getCenterNodeId(projectId),
    title: projectName,
    kind: 'center',
    role: 'center',
    x: 500,
    y: 400,
    icon: '✨',
    locked: true,
    createdAt: timestamp,
  };

  const branchNodes: ForUProjectNode[] = baseBranches.map((branch) => ({
    id: getBranchNodeId(projectId, branch.key),
    title: branch.title,
    kind: 'branch',
    role: 'branch',
    branchKey: branch.key,
    x: branch.x,
    y: branch.y,
    icon: branch.icon,
    locked: true,
    createdAt: timestamp,
  }));

  const branchEdges: ForUProjectEdge[] = baseBranches.map((branch) => ({
    id: `${projectId}-edge-center-${branch.key}`,
    source: centerNode.id,
    target: getBranchNodeId(projectId, branch.key),
    createdAt: timestamp,
  }));

  return {
    nodes: [centerNode, ...branchNodes],
    edges: branchEdges,
  };
}

const starterProject = createProject({ name: 'Mi primer proyecto' });

export const useActiveProjectsStore = create<ActiveProjectsState>()(
  persist(
    (set, get) => ({
      activeProjectIds: [starterProject.id],
      activeProjectId: starterProject.id,
      projectsById: {
        [starterProject.id]: starterProject,
      },
      rawNotes: [],
      isJarOpen: false,
      selectedNodeId: null,
      focusedBranch: null,
      viewLevel: 'archipelago',

      openProject: (input) => {
        const project = createProject(input);

        set((state) => ({
          activeProjectIds: [...state.activeProjectIds, project.id],
          activeProjectId: project.id,
          selectedNodeId: null,
          focusedBranch: null,
          viewLevel: 'archipelago',
          projectsById: {
            ...state.projectsById,
            [project.id]: project,
          },
        }));

        return project.id;
      },

      focusProject: (projectId) => {
        if (!get().projectsById[projectId]) return;
        set({ activeProjectId: projectId, selectedNodeId: null, focusedBranch: null, viewLevel: 'archipelago' });
      },

      closeProject: (projectId) => {
        set((state) => {
          const nextActiveIds = state.activeProjectIds.filter((id) => id !== projectId);
          const { [projectId]: _closedProject, ...nextProjects } = state.projectsById;
          const nextFocusedId =
            state.activeProjectId === projectId
              ? nextActiveIds[nextActiveIds.length - 1] ?? null
              : state.activeProjectId;

          return {
            activeProjectIds: nextActiveIds,
            activeProjectId: nextFocusedId,
            selectedNodeId: state.activeProjectId === projectId ? null : state.selectedNodeId,
            focusedBranch: state.activeProjectId === projectId ? null : state.focusedBranch,
            viewLevel: state.activeProjectId === projectId ? 'archipelago' : state.viewLevel,
            projectsById: nextProjects,
          };
        });
      },

      renameProject: (projectId, name) => {
        set((state) => {
          const storedProject = state.projectsById[projectId];
          if (!storedProject) return state;
          const project = normalizeProject(storedProject);
          const nextName = name.trim() || project.name;

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                name: nextName,
                nodes: project.nodes.map((node) =>
                  node.role === 'center' ? { ...node, title: nextName } : node,
                ),
              }),
            },
          };
        });
      },

      updateProjectStatus: (projectId, status) => {
        set((state) => {
          const project = state.projectsById[projectId];
          if (!project) return state;

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({ ...project, status }),
            },
          };
        });
      },

      addTask: (projectId, title) => {
        const storedProject = get().projectsById[projectId];
        const project = storedProject ? normalizeProject(storedProject) : null;
        if (!project) return null;

        const task: ForUTask = {
          id: createId('task'),
          title: title.trim() || 'Microaccion sin titulo',
          status: 'todo',
          createdAt: now(),
        };

        set((state) => ({
          projectsById: {
            ...state.projectsById,
            [projectId]: touch({
              ...project,
              tasks: [...project.tasks, task],
            }),
          },
        }));

        return task.id;
      },

      updateTaskStatus: (projectId, taskId, status) => {
        set((state) => {
          const storedProject = state.projectsById[projectId];
          if (!storedProject) return state;
          const project = normalizeProject(storedProject);

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                tasks: project.tasks.map((task) =>
                  task.id === taskId
                    ? { ...task, status, completedAt: status === 'done' ? now() : undefined }
                    : task,
                ),
              }),
            },
          };
        });
      },

      addNode: (projectId, node) => {
        const storedProject = get().projectsById[projectId];
        const project = storedProject ? normalizeProject(storedProject) : null;
        if (!project) return null;

        const projectNode: ForUProjectNode = {
          ...node,
          role: node.role ?? 'free',
          id: createId('node'),
          createdAt: now(),
        };

        set((state) => ({
          projectsById: {
            ...state.projectsById,
            [projectId]: touch({
              ...project,
              nodes: [...project.nodes, projectNode],
            }),
          },
        }));

        return projectNode.id;
      },

      addFreeNodeToBranch: (projectId, branchKey, node) => {
        const storedProject = get().projectsById[projectId];
        const project = storedProject ? normalizeProject(storedProject) : null;
        if (!project) return null;

        const branchNode = project.nodes.find((projectNode) => projectNode.branchKey === branchKey);
        if (!branchNode) return null;

        const projectNode: ForUProjectNode = {
          ...node,
          role: 'free',
          branchKey,
          id: createId('node'),
          createdAt: now(),
        };

        const edge: ForUProjectEdge = {
          id: createId('edge'),
          source: branchNode.id,
          target: projectNode.id,
          createdAt: now(),
        };

        set((state) => ({
          projectsById: {
            ...state.projectsById,
            [projectId]: touch({
              ...project,
              nodes: [...project.nodes, projectNode],
              edges: [...project.edges, edge],
            }),
          },
        }));

        return projectNode.id;
      },

      addFreeNodesToBranches: (projectId, nodes) => {
        const storedProject = get().projectsById[projectId];
        const project = storedProject ? normalizeProject(storedProject) : null;
        if (!project || nodes.length === 0) return [];

        const timestamp = now();
        const createdNodes: ForUProjectNode[] = [];
        const createdEdges: ForUProjectEdge[] = [];

        nodes.forEach((node) => {
          const branchNode = project.nodes.find((projectNode) => projectNode.branchKey === node.branchKey);
          if (!branchNode) return;

          const projectNode: ForUProjectNode = {
            ...node,
            role: 'free',
            id: createId('node'),
            createdAt: timestamp,
          };

          createdNodes.push(projectNode);
          createdEdges.push({
            id: createId('edge'),
            source: branchNode.id,
            target: projectNode.id,
            createdAt: timestamp,
          });
        });

        if (createdNodes.length === 0) return [];

        set((state) => ({
          projectsById: {
            ...state.projectsById,
            [projectId]: touch({
              ...project,
              nodes: [...project.nodes, ...createdNodes],
              edges: [...project.edges, ...createdEdges],
            }),
          },
        }));

        return createdNodes.map((node) => node.id);
      },

      updateNode: (projectId, nodeId, patch) => {
        set((state) => {
          const storedProject = state.projectsById[projectId];
          if (!storedProject) return state;
          const project = normalizeProject(storedProject);

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                nodes: project.nodes.map((node) =>
                  node.id === nodeId ? { ...node, ...patch } : node,
                ),
              }),
            },
          };
        });
      },

      reassignNodeBranch: (projectId, nodeId, branchKey) => {
        set((state) => {
          const storedProject = state.projectsById[projectId];
          if (!storedProject) return state;
          const project = normalizeProject(storedProject);
          const nodeToMove = project.nodes.find((node) => node.id === nodeId);
          const targetBranch = project.nodes.find((node) => node.role === 'branch' && node.branchKey === branchKey);
          if (!nodeToMove || !targetBranch || nodeToMove.locked || nodeToMove.branchKey === branchKey) return state;

          const nextEdges = project.edges
            .filter((edge) => edge.target !== nodeId || !project.nodes.some((node) => node.id === edge.source && node.role === 'branch'))
            .concat({
              id: createId('edge'),
              source: targetBranch.id,
              target: nodeId,
              createdAt: now(),
            });

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                nodes: project.nodes.map((node) =>
                  node.id === nodeId ? { ...node, branchKey } : node,
                ),
                edges: nextEdges,
              }),
            },
          };
        });
      },

      splitNodeIntoSubtasks: (projectId, nodeId, subtasks) => {
        const storedProject = get().projectsById[projectId];
        const project = storedProject ? normalizeProject(storedProject) : null;
        const parentNode = project?.nodes.find((node) => node.id === nodeId);
        if (!project || !parentNode || parentNode.locked || !parentNode.branchKey) return [];

        const cleanSubtasks = subtasks.map((subtask) => subtask.trim()).filter(Boolean).slice(0, 3);
        if (cleanSubtasks.length === 0) return [];

        const timestamp = now();
        const createdNodes: ForUProjectNode[] = cleanSubtasks.map((subtask, index) => ({
          id: createId('node'),
          title: subtask,
          kind: 'task',
          role: 'free',
          branchKey: parentNode.branchKey,
          parentNodeId: parentNode.id,
          priority: parentNode.priority ?? 'medium',
          icon: '✅',
          description: `Subtarea creada desde: ${parentNode.title}`,
          x: parentNode.x + 190 + index * 36,
          y: parentNode.y + (index - (cleanSubtasks.length - 1) / 2) * 92,
          createdAt: timestamp,
        }));

        const createdEdges: ForUProjectEdge[] = createdNodes.map((node) => ({
          id: createId('edge'),
          source: parentNode.id,
          target: node.id,
          createdAt: timestamp,
        }));

        set((state) => {
          const currentProject = normalizeProject(state.projectsById[projectId]);

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...currentProject,
                nodes: currentProject.nodes
                  .map((node) =>
                    node.id === parentNode.id
                      ? { ...node, subtasks: cleanSubtasks, kind: 'task' as const, icon: node.icon ?? '✅' }
                      : node,
                  )
                  .concat(createdNodes),
                edges: currentProject.edges.concat(createdEdges),
              }),
            },
          };
        });

        return createdNodes.map((node) => node.id);
      },

      moveNode: (projectId, nodeId, position) => {
        set((state) => {
          const storedProject = state.projectsById[projectId];
          if (!storedProject) return state;
          const project = normalizeProject(storedProject);

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                nodes: project.nodes.map((node) => {
                  if (node.id !== nodeId || node.locked) return node;
                  return { ...node, x: position.x, y: position.y };
                }),
              }),
            },
          };
        });
      },

      connectNodes: (projectId, source, target) => {
        if (!source || !target || source === target) return null;

        const storedProject = get().projectsById[projectId];
        const project = storedProject ? normalizeProject(storedProject) : null;
        if (!project) return null;

        const existingEdge = project.edges.find((edge) => edge.source === source && edge.target === target);
        if (existingEdge) return existingEdge.id;

        const edge: ForUProjectEdge = {
          id: createId('edge'),
          source,
          target,
          createdAt: now(),
        };

        set((state) => ({
          projectsById: {
            ...state.projectsById,
            [projectId]: touch({
              ...project,
              edges: [...project.edges, edge],
            }),
          },
        }));

        return edge.id;
      },

      removeEdge: (projectId, edgeId) => {
        set((state) => {
          const storedProject = state.projectsById[projectId];
          if (!storedProject) return state;
          const project = normalizeProject(storedProject);

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                edges: project.edges.filter((edge) => edge.id !== edgeId),
              }),
            },
          };
        });
      },

      selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

      deselectNode: () => set({ selectedNodeId: null }),

      setFocusBranch: (branchKey) => set({ focusedBranch: branchKey }),

      clearFocus: () => set({ focusedBranch: null }),

      setViewLevel: (level) => set({ viewLevel: level }),

      toggleView: () => set((state) => ({
        viewLevel:
          state.viewLevel === 'archipelago'
            ? 'exterior'
            : state.viewLevel === 'exterior'
              ? 'interior'
              : 'exterior',
      })),

      openIdeaJar: () => set({ isJarOpen: true }),

      closeIdeaJar: () => set({ isJarOpen: false }),

      toggleIdeaJar: () => set((state) => ({ isJarOpen: !state.isJarOpen })),

      addRawNote: (input) => {
        const note: ForURawNote = {
          id: createId('raw-note'),
          projectId: input.projectId ?? get().activeProjectId,
          kind: input.kind,
          content: input.content.trim() || 'Nota cruda sin texto',
          previewUrl: input.previewUrl,
          createdAt: now(),
        };

        set((state) => ({
          rawNotes: [note, ...state.rawNotes],
          isJarOpen: false,
        }));

        return note.id;
      },

      markRawNoteProcessed: (noteId) => {
        set((state) => ({
          rawNotes: state.rawNotes.map((note) =>
            note.id === noteId ? { ...note, processedAt: now() } : note,
          ),
        }));
      },

      clearRawNotes: () => set({ rawNotes: [] }),

      resetWorkspace: () => {
        const project = createProject({ name: 'Mi primer proyecto' });

        set({
          activeProjectIds: [project.id],
          activeProjectId: project.id,
          projectsById: {
            [project.id]: project,
          },
          rawNotes: [],
          isJarOpen: false,
          selectedNodeId: null,
          focusedBranch: null,
          viewLevel: 'archipelago',
        });
      },
    }),
    {
      name: 'foru-active-projects',
      version: 4,
      migrate: (persistedState) => {
        const state = persistedState as ActiveProjectsState | undefined;
        if (!state) return state;

        return {
          ...state,
          projectsById: Object.fromEntries(
            Object.entries(state.projectsById ?? {}).map(([projectId, project]) => [
              projectId,
              normalizeProject(project),
            ]),
          ),
          activeProjectIds: state.activeProjectIds ?? [],
          activeProjectId: state.activeProjectId ?? null,
          rawNotes: state.rawNotes ?? [],
          isJarOpen: state.isJarOpen ?? false,
          selectedNodeId: state.selectedNodeId ?? null,
          focusedBranch: state.focusedBranch ?? null,
          viewLevel: state.viewLevel ?? 'archipelago',
        };
      },
    },
  ),
);
