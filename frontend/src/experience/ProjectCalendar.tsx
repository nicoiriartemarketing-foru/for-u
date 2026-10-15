import type {AreaTask} from '../pages/dashboard/areaModel';
import {lazy,Suspense} from 'react';
import {useAuth} from '../contexts/AuthContext';
import {useActiveProjectsStore} from '../stores/useActiveProjectsStore';
import {ToolkitProvider,useToolkit} from '../toolkit/ToolkitContext';
import {businessFromProject} from '../toolkit/types';
import {ButtonSecondary} from '../components/ui/DesignSystem';
const Calendar=lazy(()=>import('../toolkit/Calendar'));
export default function ProjectCalendar({projectId,tasks,onOpen}:{projectId:string;tasks:AreaTask[];onOpen:(task:AreaTask)=>void}){const {user}=useAuth();const store=useActiveProjectsStore();const project=store.cloudUserId===user?.id?store.projectsById[projectId]:null;if(!user||!project)return <p role="alert">Este calendario no está disponible.</p>;return <ToolkitProvider key={`${user.id}:${projectId}`} userId={user.id} projectId={projectId} business={businessFromProject(project)}><Ready tasks={tasks} onOpen={onOpen}/></ToolkitProvider>;}
function Ready({tasks,onOpen}:{tasks:AreaTask[];onOpen:(task:AreaTask)=>void}){const {loading,loadError,reload}=useToolkit();if(loading)return <p role="status">Cargando agenda…</p>;if(loadError)return <div role="alert"><p>No pudimos cargar la agenda. Tus tareas se conservan.</p><ButtonSecondary onClick={()=>void reload()}>Reintentar agenda</ButtonSecondary></div>;return <Suspense fallback={<p role="status">Abriendo calendario…</p>}><Calendar linkedTasks={tasks} onOpenTask={onOpen}/></Suspense>;}
