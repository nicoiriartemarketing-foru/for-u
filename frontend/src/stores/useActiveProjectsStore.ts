import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ForUProjectStatus = 'active' | 'paused' | 'blocked' | 'completed';
export type ForUTaskStatus = 'todo' | 'doing' | 'done';
export type ForUNodeKind = 'idea' | 'task' | 'resource' | 'blocker' | 'inspiration';
export type ForURawNoteKind = 'text' | 'audio' | 'photo';

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
  x: number;
  y: number;
  icon?: string;
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

type ActiveProjectsState = {
  activeProjectIds: string[];
  activeProjectId: string | null;
  projectsById: Record<string, ForUActiveProject>;
  rawNotes: ForURawNote[];
  isJarOpen: boolean;
  openProject: (input: CreateProjectInput) => string;
  focusProject: (projectId: string) => void;
  closeProject: (projectId: string) => void;
  renameProject: (projectId: string, name: string) => void;
  updateProjectStatus: (projectId: string, status: ForUProjectStatus) => void;
  addTask: (projectId: string, title: string) => string | null;
  updateTaskStatus: (projectId: string, taskId: string, status: ForUTaskStatus) => void;
  addNode: (projectId: string, node: Omit<ForUProjectNode, 'id' | 'createdAt'>) => string | null;
  updateNode: (projectId: string, nodeId: string, patch: Partial<Omit<ForUProjectNode, 'id'>>) => void;
  moveNode: (projectId: string, nodeId: string, position: { x: number; y: number }) => void;
  connectNodes: (projectId: string, source: string, target: string) => string | null;
  removeEdge: (projectId: string, edgeId: string) => void;
  openIdeaJar: () => void;
  closeIdeaJar: () => void;
  toggleIdeaJar: () => void;
  addRawNote: (input: CreateRawNoteInput) => string;
  markRawNoteProcessed: (noteId: string) => void;
  clearRawNotes: () => void;
  resetWorkspace: () => void;
};

const starterProject = createProject({ name: 'Mi primer proyecto' });

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

  return {
    id: createId('project'),
    name: input.name.trim() || 'Proyecto sin nombre',
    status: input.status ?? 'active',
    tasks: [],
    nodes: [],
    edges: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function touch(project: ForUActiveProject): ForUActiveProject {
  return { ...project, updatedAt: now() };
}

function normalizeProject(project: ForUActiveProject): ForUActiveProject {
  return {
    ...project,
    tasks: project.tasks ?? [],
    nodes: project.nodes ?? [],
    edges: project.edges ?? [],
  };
}

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

      openProject: (input) => {
        const project = createProject(input);

        set((state) => ({
          activeProjectIds: [...state.activeProjectIds, project.id],
          activeProjectId: project.id,
          projectsById: {
            ...state.projectsById,
            [project.id]: project,
          },
        }));

        return project.id;
      },

      focusProject: (projectId) => {
        if (!get().projectsById[projectId]) return;
        set({ activeProjectId: projectId });
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
            projectsById: nextProjects,
          };
        });
      },

      renameProject: (projectId, name) => {
        set((state) => {
          const project = state.projectsById[projectId];
          if (!project) return state;

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({ ...project, name: name.trim() || project.name }),
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
                nodes: project.nodes.map((node) =>
                  node.id === nodeId ? { ...node, x: position.x, y: position.y } : node,
                ),
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
        });
      },
    }),
    {
      name: 'foru-active-projects',
      version: 1,
    },
  ),
);
