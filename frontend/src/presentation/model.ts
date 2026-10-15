export type PresentationVersion=1|2;
export function presentationVersion(value:unknown):PresentationVersion {if(value===undefined||value===1)return 1;if(value===2)return 2;throw new Error('Esta versión de presentación no es compatible. No se modificó la página.');}
export const presentationClass=(value:unknown)=>presentationVersion(value)===2?'foru-presentation-v2':'';
