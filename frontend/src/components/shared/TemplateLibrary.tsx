import { useState } from 'react';
import { templatesByType } from '../../data/templates/index';
import { templateCategories, type ContentTemplate, type TemplateCategory } from '../../data/templates/types';
import type { ModuleType } from '../../modules/moduleProjects';
export default function TemplateLibrary({ type, onSelect, onCreateFromScratch }: { type: ModuleType; onSelect: (template: ContentTemplate) => void; onCreateFromScratch: () => void }) {
  const [category, setCategory] = useState<TemplateCategory>('reconocimiento');
  return <section className="creator-library"><div className="creator-section-heading"><h2>Plantillas para tu negocio</h2><button className="creator-scratch" onClick={onCreateFromScratch}>Crear desde cero</button></div>
    <label>¿Qué quieres comunicar?<select value={category} onChange={event => setCategory(event.target.value as TemplateCategory)}>{Object.entries(templateCategories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
    <div className="creator-template-grid">{templatesByType[type].filter(template => template.category === category).map(template => <button key={template.id} className="creator-template" onClick={() => onSelect(template)}><span className="creator-template-preview" style={{ background: template.background, color: template.foreground }}>{template.preview}</span><strong>{template.name}</strong><span>Personalizar plantilla</span></button>)}</div>
  </section>;
}
