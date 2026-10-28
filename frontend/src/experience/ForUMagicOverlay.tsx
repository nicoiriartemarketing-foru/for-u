import {useSyncExternalStore} from 'react';
import Logo from '../components/Logo';
import {magicSnapshot,subscribeMagic} from './magicTransition';
import './magicTransition.css';
export default function MagicTransition(){const value=useSyncExternalStore(subscribeMagic,magicSnapshot,()=>null);if(!value)return null;return <div className={`foru-magic-transition${value.finishing?' is-finishing':''}`} role="status" aria-live="polite"><div className="foru-magic-orbit" aria-hidden="true"/><Logo/><p>{value.label}</p><small>Tu creación sigue contigo.</small></div>;}
