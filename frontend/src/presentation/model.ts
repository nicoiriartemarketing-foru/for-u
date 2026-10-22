export type PresentationVersion=1|2|3;
export function presentationVersion(value:unknown):PresentationVersion {if(value===undefined||value===1)return 1;if(value===2||value===3)return value;throw new Error('Esta versión de presentación no es compatible. No se modificó la página.');}
export const presentationClass=(value:unknown)=>{const v=presentationVersion(value);return v===3?'foru-presentation-v2 foru-presentation-v3':v===2?'foru-presentation-v2':'';};
