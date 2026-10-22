/** One shared registry: a design and its script may both have pending work. */
export function pendingNavigation(){
 const owners=new Set<symbol>();let permitted=false;
 return {
  register(owner:symbol){owners.add(owner);return ()=>{owners.delete(owner);};},
  pending(){return owners.size>0;},
  confirm(ask:()=>boolean,defer:(clear:()=>void)=>void){
   if(!owners.size)return true;
   if(!ask())return false;
   permitted=true;defer(()=>{permitted=false;});return true;
  },
  blocks(current:{pathname:string;search:string},next:{pathname:string;search:string}){
   if(current.pathname===next.pathname&&current.search===next.search)return false;
   if(!owners.size)return false;
   if(permitted){permitted=false;return false;}
   return true;
  },
 };
}
export const navigationState=pendingNavigation();
