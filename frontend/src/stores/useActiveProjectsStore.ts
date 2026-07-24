import { create, type StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

export type ForUProjectStatus = 'active' | 'paused' | 'blocked' | 'completed';
export type ForUTaskStatus = 'todo' | 'doing' | 'done';
export type ForUNodeKind = 'center' | 'branch' | 'idea' | 'task' | 'resource' | 'blocker' | 'inspiration';
export type ForUNodeRole = 'center' | 'branch' | 'free';
export type ForUBranchKey = 'ideas' | 'actions' | 'finances' | 'marketing' | 'resources';
export type ForUNodePriority = 'high' | 'medium' | 'low';
export type ForURawNoteKind = 'text' | 'audio' | 'photo';
export type ForUWorldViewLevel = 'archipelago' | 'exterior' | 'interior';
export type ForUWorkspaceView = 'map' | 'kanban' | 'gantt' | 'archipelago' | 'dashboard';
export type ForUProjectGuideState = 'empty' | 'raw' | 'organized' | 'planned' | 'active' | 'completed';

export type ForUArchipelagoOffset = {
  x: number;
  y: number;
};

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
  completedAt?: string;
  rewardCoins?: number;
  taskStatus?: ForUTaskStatus;
  locked?: boolean;
  linkedTaskId?: string;
  externalUrl?: string;
  lastActiveDate: string;
  createdAt: string;
};

export type ForUProjectEdge = {
  id: string;
  source: string;
  target: string;
  createdAt: string;
};

export type ForURouteStep = {
  id: string;
  title: string;
  linkedNodeId: string;
  completedAt?: string;
};

export type ForUActiveProject = {
  id: string;
  name: string;
  status: ForUProjectStatus;
  tasks: ForUTask[];
  nodes: ForUProjectNode[];
  edges: ForUProjectEdge[];
  digitalRoute: ForURouteStep[];
  currentRouteIndex: number;
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

export type CreateFreeNodeForBranchInput = Omit<ForUProjectNode, 'id' | 'createdAt' | 'lastActiveDate' | 'role'> & {
  branchKey: ForUBranchKey;
};

export type WeeklyMilestoneResult = {
  milestoneAchieved: boolean;
};

export type DailyRewardStatus = {
  shouldShow: boolean;
  currentDay: number;
  reward: number;
};

type ActiveProjectsState = {
  activeProjectIds: string[];
  activeProjectId: string | null;
  currentProjectId: string | null;
  lastCreatedProjectId: string | null;
  projectsById: Record<string, ForUActiveProject>;
  rawNotes: ForURawNote[];
  isJarOpen: boolean;
  selectedNodeId: string | null;
  focusedBranch: ForUBranchKey | null;
  viewLevel: ForUWorldViewLevel;
  currentView: ForUWorkspaceView;
  archipelagoZoom: number;
  archipelagoOffset: ForUArchipelagoOffset;
  userLevel: number;
  userXP: number;
  xpToNextLevel: number;
  coins: number;
  weeklyMilestoneProgress: number;
  lastLoginDate: string | null;
  dailyStreak: number;
  claimedDays: number[];
  getAllProjects: () => ForUActiveProject[];
  getActiveProjects: () => ForUActiveProject[];
  getProjectById: (projectId: string) => ForUActiveProject | null;
  getProjectState: (projectId: string) => ForUProjectGuideState;
  getDustyNodes: () => ForUProjectNode[];
  clearLastCreatedProject: () => void;
  switchProject: (projectId: string) => void;
  setView: (view: ForUWorkspaceView) => void;
  setZoom: (level: number) => void;
  setArchipelagoOffset: (offset: ForUArchipelagoOffset) => void;
  panToIsland: (projectId: string) => void;
  resetArchipelagoView: () => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  checkWeeklyMilestone: () => WeeklyMilestoneResult;
  checkDailyReward: () => DailyRewardStatus;
  claimDailyReward: (day?: number) => boolean;
  openProject: (input: CreateProjectInput) => string;
  focusProject: (projectId: string) => void;
  closeProject: (projectId: string) => void;
  renameProject: (projectId: string, name: string) => void;
  updateProjectStatus: (projectId: string, status: ForUProjectStatus) => void;
  addTask: (projectId: string, title: string) => string | null;
  updateTaskStatus: (projectId: string, taskId: string, status: ForUTaskStatus) => void;
  addNode: (projectId: string, node: Omit<ForUProjectNode, 'id' | 'createdAt' | 'lastActiveDate'>) => string | null;
  addFreeNodeToBranch: (projectId: string, branchKey: ForUBranchKey, node: Omit<ForUProjectNode, 'id' | 'createdAt' | 'lastActiveDate' | 'role'>) => string | null;
  addFreeNodesToBranches: (projectId: string, nodes: CreateFreeNodeForBranchInput[]) => string[];
  updateNode: (projectId: string, nodeId: string, patch: Partial<Omit<ForUProjectNode, 'id'>>) => void;
  reassignNodeBranch: (projectId: string, nodeId: string, branchKey: ForUBranchKey) => void;
  splitNodeIntoSubtasks: (projectId: string, nodeId: string, subtasks: string[]) => string[];
  setDigitalRoute: (projectId: string, route: ForURouteStep[]) => void;
  completeRouteStep: (projectId: string) => boolean;
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

function clampZoom(level: number) {
  return Math.min(2, Math.max(0.3, Number.isFinite(level) ? level : 0.45));
}

const DUST_THRESHOLD_MS = 48 * 60 * 60 * 1000;
const WEEKLY_MILESTONE_GOAL = 5;
export const dailyRewards = [10, 20, 50, 50, 100] as const;

function getProjectOrder(state: Pick<ActiveProjectsState, 'activeProjectIds' | 'projectsById'>) {
  return Array.from(new Set([...(state.activeProjectIds ?? []), ...Object.keys(state.projectsById ?? {})]));
}

function getDayStamp(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getPreviousDayStamp(date = new Date()) {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return getDayStamp(previous);
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
    digitalRoute: [],
    currentRouteIndex: 0,
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
  const nodes = (project.nodes ?? []).map((node) => ({
    ...node,
    lastActiveDate: node.lastActiveDate ?? node.createdAt ?? project.updatedAt ?? timestamp,
  }));
  const edges = project.edges ?? [];
  const missingBaseNodes = base.nodes.filter((baseNode) => !nodes.some((node) => node.id === baseNode.id));
  const missingBaseEdges = base.edges.filter((baseEdge) => !edges.some((edge) => edge.id === baseEdge.id));

  return {
    ...project,
    tasks: project.tasks ?? [],
    nodes: [...missingBaseNodes, ...nodes],
    edges: [...missingBaseEdges, ...edges],
    digitalRoute: project.digitalRoute ?? [],
    currentRouteIndex: project.currentRouteIndex ?? 0,
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
  { key: 'ideas', title: 'Ideas', icon: '💡', x: 240, y: 210, color: '#F4D03F' },
  { key: 'actions', title: 'Acciones', icon: '✅', x: 760, y: 210, color: '#58D68D' },
  { key: 'finances', title: 'Finanzas', icon: '💰', x: 830, y: 400, color: '#8E7CC3' },
  { key: 'marketing', title: 'Marketing', icon: '📱', x: 760, y: 590, color: '#F9A8D4' },
  { key: 'resources', title: 'Recursos', icon: '📚', x: 240, y: 590, color: '#F5B041' },
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
    lastActiveDate: timestamp,
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
    lastActiveDate: timestamp,
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

const createActiveProjectsState = (set: any, get: any): ActiveProjectsState => ({
      activeProjectIds: [starterProject.id],
      activeProjectId: starterProject.id,
      currentProjectId: starterProject.id,
      lastCreatedProjectId: null,
      projectsById: {
        [starterProject.id]: starterProject,
      },
      rawNotes: [],
      isJarOpen: false,
      selectedNodeId: null,
      focusedBranch: null,
      viewLevel: 'archipelago',
      currentView: 'archipelago',
      archipelagoZoom: 0.45,
      archipelagoOffset: { x: 80, y: 80 },
      userLevel: 1,
      userXP: 0,
      xpToNextLevel: 100,
      coins: 0,
      weeklyMilestoneProgress: 0,
      lastLoginDate: null,
      dailyStreak: 0,
      claimedDays: [],

      getAllProjects: () => {
        const state = get();
        const projectIds = getProjectOrder(state);

        return projectIds
          .map((projectId) => state.projectsById[projectId])
          .filter(Boolean)
          .map((project) => normalizeProject(project));
      },

      getActiveProjects: () => {
        const state = get();
        const projectIds = getProjectOrder(state);

        return projectIds
          .map((projectId) => state.projectsById[projectId])
          .filter((project): project is ForUActiveProject => Boolean(project) && project.status === 'active')
          .map((project) => normalizeProject(project));
      },

      getProjectById: (projectId) => {
        const project = get().projectsById[projectId];
        return project ? normalizeProject(project) : null;
      },

      getProjectState: (projectId) => {
        const state = get();
        const storedProject = state.projectsById[projectId];
        if (!storedProject) return 'empty';

        const project = normalizeProject(storedProject);
        const rawNotesForProject = state.rawNotes.filter((note) =>
          !note.processedAt && (note.projectId === projectId || (!note.projectId && projectId === state.activeProjectId)),
        );
        const freeNodes = project.nodes.filter((node) => node.role === 'free');
        const completedNodes = freeNodes.filter((node) => node.completedAt || node.taskStatus === 'done');
        const routeIsComplete = project.digitalRoute.length > 0
          && project.digitalRoute.every((step) => Boolean(step.completedAt))
          && project.currentRouteIndex >= project.digitalRoute.length;

        if (routeIsComplete) return 'completed';
        if (rawNotesForProject.length > 0) return 'raw';
        if (freeNodes.length === 0) return 'empty';
        if (project.digitalRoute.length === 0) return 'organized';
        if (completedNodes.length === 0) return 'planned';

        return 'active';
      },

      getDustyNodes: () => {
        const state = get();
        const cutoff = Date.now() - DUST_THRESHOLD_MS;

        return getProjectOrder(state)
          .flatMap((projectId) => {
            const project = state.projectsById[projectId];
            return project ? normalizeProject(project).nodes : [];
          })
          .filter((node) => {
            if (node.locked || node.completedAt) return false;
            return new Date(node.lastActiveDate).getTime() < cutoff;
          });
      },

      switchProject: (projectId) => {
        if (!get().projectsById[projectId]) return;
        set({
          activeProjectId: projectId,
          currentProjectId: projectId,
          selectedNodeId: null,
          focusedBranch: null,
          viewLevel: 'archipelago',
        });
      },

      clearLastCreatedProject: () => set({ lastCreatedProjectId: null }),

      setView: (view) => set({ currentView: view, selectedNodeId: null }),

      setZoom: (level) => set({ archipelagoZoom: clampZoom(level) }),

      setArchipelagoOffset: (offset) => set({ archipelagoOffset: offset }),

      panToIsland: (projectId) => {
        const state = get();
        const index = Math.max(0, getProjectOrder(state).indexOf(projectId));
        const columns = 3;
        const column = index % columns;
        const row = Math.floor(index / columns);

        set({
          activeProjectId: projectId,
          currentProjectId: projectId,
          currentView: 'archipelago',
          selectedNodeId: null,
          focusedBranch: null,
          archipelagoZoom: 1.45,
          archipelagoOffset: {
            x: 150 - column * 860,
            y: 110 - row * 660,
          },
        });
      },

      resetArchipelagoView: () => set({
        currentView: 'archipelago',
        archipelagoZoom: 0.45,
        archipelagoOffset: { x: 80, y: 80 },
        selectedNodeId: null,
        focusedBranch: null,
      }),

      addXP: (amount) => {
        const cleanAmount = Math.max(0, Math.floor(amount));
        if (cleanAmount === 0) return;

        set((state) => {
          let nextLevel = state.userLevel;
          let nextXP = state.userXP + cleanAmount;
          const xpToNextLevel = state.xpToNextLevel || 100;

          while (nextXP >= xpToNextLevel) {
            nextLevel += 1;
            nextXP -= xpToNextLevel;
          }

          return {
            userLevel: nextLevel,
            userXP: nextXP,
            xpToNextLevel,
          };
        });
      },

      addCoins: (amount) => {
        const cleanAmount = Math.max(0, Math.floor(amount));
        if (cleanAmount === 0) return;

        set((state) => ({
          coins: state.coins + cleanAmount,
        }));
      },

      checkWeeklyMilestone: () => {
        const progress = get().weeklyMilestoneProgress;
        const milestoneAchieved = progress >= WEEKLY_MILESTONE_GOAL;

        if (milestoneAchieved) {
          set({ weeklyMilestoneProgress: 0 });
        }

        return { milestoneAchieved };
      },

      checkDailyReward: () => {
        const state = get();
        const today = getDayStamp();
        const alreadyClaimedToday = state.lastLoginDate === today;
        const cleanStreak = state.lastLoginDate === getPreviousDayStamp() || alreadyClaimedToday ? state.dailyStreak : 0;
        const currentDay = alreadyClaimedToday
          ? Math.max(1, Math.min(cleanStreak, dailyRewards.length))
          : cleanStreak >= dailyRewards.length
            ? 1
            : cleanStreak + 1;

        return {
          shouldShow: !alreadyClaimedToday,
          currentDay,
          reward: dailyRewards[currentDay - 1] ?? dailyRewards[dailyRewards.length - 1],
        };
      },

      claimDailyReward: (day) => {
        const rewardStatus = get().checkDailyReward();
        const rewardDay = day ?? rewardStatus.currentDay;
        const reward = dailyRewards[rewardDay - 1];
        if (!reward) return false;

        const today = getDayStamp();
        const state = get();
        const continuedStreak = state.lastLoginDate === getPreviousDayStamp();
        const cycleFinished = continuedStreak && state.dailyStreak >= dailyRewards.length;
        if (state.lastLoginDate === today || (!cycleFinished && state.claimedDays.includes(rewardDay))) return false;
        const nextStreak = continuedStreak && !cycleFinished ? state.dailyStreak + 1 : 1;
        const cleanDay = Math.min(rewardDay, dailyRewards.length);

        set({
          coins: state.coins + reward,
          lastLoginDate: today,
          dailyStreak: nextStreak,
          claimedDays: Array.from(new Set([...(continuedStreak && !cycleFinished ? state.claimedDays : []), cleanDay])).slice(0, dailyRewards.length),
        });

        return true;
      },

      openProject: (input) => {
        const project = createProject(input);

        set((state) => ({
          activeProjectIds: [...state.activeProjectIds, project.id],
          activeProjectId: project.id,
          currentProjectId: project.id,
          lastCreatedProjectId: project.id,
          selectedNodeId: null,
          focusedBranch: null,
          viewLevel: 'archipelago',
          currentView: 'archipelago',
          archipelagoZoom: 0.45,
          archipelagoOffset: { x: 80, y: 80 },
          projectsById: {
            ...state.projectsById,
            [project.id]: project,
          },
        }));

        return project.id;
      },

      focusProject: (projectId) => {
        if (!get().projectsById[projectId]) return;
        set({ activeProjectId: projectId, currentProjectId: projectId, selectedNodeId: null, focusedBranch: null, viewLevel: 'archipelago' });
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
          currentProjectId: nextFocusedId,
          lastCreatedProjectId: state.lastCreatedProjectId === projectId ? null : state.lastCreatedProjectId,
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
          lastActiveDate: now(),
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
          lastActiveDate: now(),
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
            lastActiveDate: timestamp,
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
          const currentNode = project.nodes.find((node) => node.id === nodeId);
          const rewardDelta = currentNode
            ? Math.max(0, (patch.rewardCoins ?? currentNode.rewardCoins ?? 0) - (currentNode.rewardCoins ?? 0))
            : 0;
          const completedNow = Boolean(currentNode && !currentNode.completedAt && patch.completedAt);

          return {
            coins: state.coins + rewardDelta,
            weeklyMilestoneProgress: completedNow ? state.weeklyMilestoneProgress + 1 : state.weeklyMilestoneProgress,
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                nodes: project.nodes.map((node) =>
                  node.id === nodeId ? { ...node, ...patch, lastActiveDate: patch.lastActiveDate ?? now() } : node,
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
                  node.id === nodeId ? { ...node, branchKey, lastActiveDate: now() } : node,
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
          lastActiveDate: timestamp,
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
                      ? { ...node, subtasks: cleanSubtasks, kind: 'task' as const, icon: node.icon ?? '✅', lastActiveDate: timestamp }
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

      setDigitalRoute: (projectId, route) => {
        set((state) => {
          const storedProject = state.projectsById[projectId];
          if (!storedProject) return state;
          const project = normalizeProject(storedProject);
          const nodeIds = new Set(project.nodes.map((node) => node.id));
          const cleanRoute = route.filter((step) => nodeIds.has(step.linkedNodeId)).slice(0, 5);

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                digitalRoute: cleanRoute,
                currentRouteIndex: 0,
              }),
            },
          };
        });
      },

      completeRouteStep: (projectId) => {
        const storedProject = get().projectsById[projectId];
        const project = storedProject ? normalizeProject(storedProject) : null;
        if (!project || project.digitalRoute.length === 0) return false;

        const currentIndex = Math.min(project.currentRouteIndex, project.digitalRoute.length - 1);
        const currentStep = project.digitalRoute[currentIndex];
        if (!currentStep || currentStep.completedAt) return false;

        const timestamp = now();
        const currentNode = project.nodes.find((node) => node.id === currentStep.linkedNodeId);
        const isDustyRouteNode = currentNode
          ? !currentNode.locked
            && !currentNode.completedAt
            && new Date(currentNode.lastActiveDate).getTime() < Date.now() - DUST_THRESHOLD_MS
          : false;
        const coinReward = isDustyRouteNode ? 60 : 20;

        set((state) => {
          const currentProject = normalizeProject(state.projectsById[projectId]);
          const nextRoute = currentProject.digitalRoute.map((step, index) =>
            index === currentIndex ? { ...step, completedAt: timestamp } : step,
          );

          return {
            userXP: state.userXP,
            coins: state.coins + coinReward,
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...currentProject,
                digitalRoute: nextRoute,
                currentRouteIndex: Math.min(currentIndex + 1, nextRoute.length),
                nodes: currentProject.nodes.map((node) =>
                  node.id === currentStep.linkedNodeId
                    ? { ...node, taskStatus: 'done' as const, completedAt: node.completedAt ?? timestamp, rewardCoins: (node.rewardCoins ?? 0) + 20, lastActiveDate: timestamp }
                    : node,
                ),
              }),
            },
          };
        });

        get().addXP(50);
        return true;
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
                  return { ...node, x: position.x, y: position.y, lastActiveDate: now() };
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

      selectNode: (nodeId) => {
        const activeProjectId = get().activeProjectId;

        if (!activeProjectId) {
          set({ selectedNodeId: nodeId });
          return;
        }

        set((state) => {
          const storedProject = state.projectsById[activeProjectId];
          if (!storedProject) return { selectedNodeId: nodeId };
          const project = normalizeProject(storedProject);

          return {
            selectedNodeId: nodeId,
            projectsById: {
              ...state.projectsById,
              [activeProjectId]: touch({
                ...project,
                nodes: project.nodes.map((node) =>
                  node.id === nodeId ? { ...node, lastActiveDate: now() } : node,
                ),
              }),
            },
          };
        });
      },

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
          currentProjectId: project.id,
          lastCreatedProjectId: null,
          projectsById: {
            [project.id]: project,
          },
          rawNotes: [],
          isJarOpen: false,
          selectedNodeId: null,
          focusedBranch: null,
          viewLevel: 'archipelago',
          currentView: 'archipelago',
          archipelagoZoom: 0.45,
          archipelagoOffset: { x: 80, y: 80 },
          userLevel: 1,
          userXP: 0,
          xpToNextLevel: 100,
          coins: 0,
          weeklyMilestoneProgress: 0,
          lastLoginDate: null,
          dailyStreak: 0,
          claimedDays: [],
        });
      },
});

export const useActiveProjectsStore = create<ActiveProjectsState>()(
  persist(
    createActiveProjectsState,
    {
      name: 'foru-active-projects',
      version: 9,
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
          activeProjectIds: getProjectOrder({
            activeProjectIds: state.activeProjectIds ?? [],
            projectsById: state.projectsById ?? {},
          }),
          activeProjectId: state.activeProjectId ?? null,
          currentProjectId: state.currentProjectId ?? state.activeProjectId ?? null,
          lastCreatedProjectId: state.lastCreatedProjectId ?? null,
          rawNotes: state.rawNotes ?? [],
          isJarOpen: state.isJarOpen ?? false,
          selectedNodeId: state.selectedNodeId ?? null,
          focusedBranch: state.focusedBranch ?? null,
          viewLevel: state.viewLevel ?? 'archipelago',
          currentView: state.currentView ?? 'archipelago',
          archipelagoZoom: state.archipelagoZoom ?? 0.45,
          archipelagoOffset: state.archipelagoOffset ?? { x: 80, y: 80 },
          userLevel: state.userLevel ?? 1,
          userXP: state.userXP ?? 0,
          xpToNextLevel: state.xpToNextLevel ?? 100,
          coins: state.coins ?? 0,
          weeklyMilestoneProgress: state.weeklyMilestoneProgress ?? 0,
          lastLoginDate: state.lastLoginDate ?? null,
          dailyStreak: state.dailyStreak ?? 0,
          claimedDays: state.claimedDays ?? [],
        };
      },
    },
  ) as unknown as StateCreator<ActiveProjectsState>,
);
