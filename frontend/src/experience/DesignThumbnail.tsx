import type {ContentDraft} from '../components/shared/contentModel';
import ProjectImage from '../components/shared/ProjectImage';
import {MediaScope} from '../components/shared/mediaScope';
import {mediaReference} from '../components/shared/mediaReference';
/** Same editable source assets as the saved design. This is a template preview, never an AI render. */
export default function DesignThumbnail({draft,user,project}:{draft:ContentDraft;user:string;project:string}){
 return <MediaScope.Provider value={{userId:user,projectId:project}}><div className="composer-thumbnail" style={{aspectRatio:draft.format==='story'?'9/16':draft.format==='portrait'?'4/5':'1',background:draft.background,color:draft.foreground}} aria-label={`Vista de ${draft.title}`}><small>{draft.brandName}</small>{(draft.imagePath||draft.sourceImageUrl)&&<ProjectImage value={draft.imagePath?mediaReference(draft.imagePath):draft.sourceImageUrl||''} alt={draft.title}/>}<strong>{draft.title}</strong><p>{draft.subtitle}</p>{draft.cta&&<span>{draft.cta}</span>}</div></MediaScope.Provider>;
}
