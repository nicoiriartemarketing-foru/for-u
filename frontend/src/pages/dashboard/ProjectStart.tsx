import {useState} from 'react';
import {Link} from 'react-router-dom';
import type {ModuleType} from '../../modules/moduleProjects';
import {useAreaDocuments} from './AreaDocuments';
import {taskWorkPath} from './workspaceFocusModel';
import './projectStart.css';
export default function ProjectStart({projectId,type}:{projectId:string;type:ModuleType}){
 const {entry,reload}=useAreaDocuments(projectId,type);
 const [chosen,setChosen]=useState<string|null>(null);
 if(!entry?.loaded)return <section className="project-start" aria-busy="true"><p role="status">Buscando tu siguiente paso…</p></section>;
 if(entry.error)return <section className="project-start"><h2>Tu proyecto sigue aquí</h2><p role="alert">No pudimos consultar tus pasos. No los sustituimos por una lista vacía.</p><button type="button" onClick={()=>void reload()}>Reintentar</button><Link to={`/dashboard/tools/landing?project=${projectId}`}>Abrir mi página</Link></section>;
 const pending=entry.tasks.tasks.filter(task=>!task.done),task=pending.find(task=>task.id===chosen)||pending.find(task=>task.status==='doing')||pending[0];
 const destination=task&&taskWorkPath(projectId,task,type);
 const page=`/dashboard/tools/landing?project=${projectId}`;
 return <section className="project-start" aria-labelledby="project-next-step"><div className="project-start-route" aria-hidden="true"><span>⌁</span><i/><span>✦</span><i/><span>⚑</span></div><p className="project-start-kicker">TU RUTA · PASO A PASO</p><h2 id="project-next-step">{task?task.title:'Haz tuya tu página'}</h2><p className="project-start-help">{task?'Abre este paso y trabaja ahí. Puedes volver a este inicio cuando quieras.':'Edita tu página y después crea contenido a partir de ella. Tú eliges cuándo publicarla.'}</p><Link className="project-start-primary" to={destination||page}>{task&&destination?'Empezar este paso':'Editar mi página'} <span aria-hidden="true">→</span></Link>{destination&&destination!==page&&<Link className="project-start-secondary" to={page}>Prefiero editar mi página</Link>}<ol className="project-start-steps" aria-label="Pasos de mi ruta">{entry.tasks.tasks.map((row,index)=><li key={row.id} className={row.done?'is-done':row.id===task?.id?'is-current':''}><span className="project-start-number" aria-hidden="true">{row.done?'✓':index+1}</span><div>{row.done?<strong>{row.title}</strong>:<button type="button" aria-pressed={row.id===task?.id} onClick={()=>setChosen(row.id)}>{row.title}</button>}<small>{row.done?'Completado':row.id===task?.id?'Empieza aquí':'Después, a tu ritmo'}</small></div></li>)}</ol><p className="project-start-goal"><span aria-hidden="true">⚑</span> Hacia tu próxima venta<small>La ruta prepara tu negocio; una venta se registra cuando ocurre.</small></p><Link className="project-start-secondary" to={`/dashboard?project=${projectId}&setup=1`}>Ajustar mis respuestas</Link><p className="project-start-orientation">Tu mapa te orienta. Kanban organiza tus pasos. Calendario reúne tus fechas. Los tienes siempre arriba.</p></section>;
}
