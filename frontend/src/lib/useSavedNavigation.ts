import {useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
/** Navigate only after successful writes are reflected by the clean-work guard. */
export function useSavedNavigation(ready:boolean){
 const navigate=useNavigate(),[destination,setDestination]=useState('');
 useEffect(()=>{if(destination&&ready){setDestination('');navigate(destination);}},[destination,ready,navigate]);
 return setDestination;
}
