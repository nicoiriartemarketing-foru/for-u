import { Card as DSCard } from '../../components/ui/DesignSystem';
import { StepIndicator } from '../../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput, Textarea as DSTextarea, ButtonPrimary as DSButtonPrimary } from '../../components/ui/DesignSystem';
import ProjectImage from '../../components/shared/ProjectImage';
import ProjectImageField from '../../components/shared/ProjectImageField';
import { useModuleDraft } from '../useModuleDraft';
import { useState, type FormEvent } from 'react';
import { moveSection, saveDish, type Dish, type RestaurantData } from './model';
import './restaurant.css';
import RestaurantMenu from './RestaurantMenu';
import { loadAlfajoresDemo } from './demo';

export type RestaurantEditorProps = {
  data: RestaurantData;
  onChange: (data: RestaurantData) => void;
};

const blankDish = (): Dish => ({ id: crypto.randomUUID(), name: '', description: '', price: 0, image: '', category: 'Platos', available: true });

export default function RestaurantEditor({ data, onChange }: RestaurantEditorProps) {
  const [dish, setDish] = useState<Dish | null>(null);
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  useModuleDraft(!!dish);
  const settings = data.settings;
  function updateSettings(patch: Partial<RestaurantData['settings']>) {
    onChange({ ...data, settings: { ...settings, ...patch } });
  }
  function submitDish(event: FormEvent) {
    event.preventDefault();
    if (!dish) return;
    try { onChange(saveDish(data, dish)); setDish(null); setMessage('Plato actualizado en el menú.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo guardar el plato.'); }
  }
  return <div className="restaurant-module">
    <StepIndicator currentStep={currentStep} totalSteps={3} labels={['Datos básicos', 'Menú', 'Publicar']} onStepChange={step => { setCurrentStep(step); document.getElementById(['restaurant-basics', 'restaurant-menu-edit', 'restaurant-publish'][step - 1])?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }} />
    <DSCard as="section" className="component-card restaurant-quick-start"><h2>Tu menú en tres pasos</h2><p>1. Agrega tus productos o carga la demo. 2. Escribe tu WhatsApp y guarda. 3. Publica tu enlace al final de esta página.</p>{!data.dishes.length && <DSButtonSecondary type="button" disabled={!!dish} onClick={() => { try { onChange(loadAlfajoresDemo(data, window.location.origin)); setMessage('Demo cargada: revisa los precios, reemplaza las imágenes de ejemplo y agrega tu WhatsApp. Después guarda los cambios.'); } catch (error) { setMessage((error as Error).message); } }}>Cargar demo de alfajores</DSButtonSecondary>}<p>Los precios e imágenes de la demo son ejemplos editables.</p></DSCard>
    <p role="status">{message}</p>
    <details className="component-card"><summary>Vista previa del menú para clientes</summary><p>Prueba la carta y el pedido antes de publicar. Esta vista todavía no es una dirección pública.</p><RestaurantMenu data={data} /></details>
    <DSCard as="section" id="restaurant-basics" className="component-card">
      <h2 className="component-title">Portada principal</h2>
      <div className="restaurant-fields">
        <DSInput label="Nombre del restaurante" info="El nombre que tus clientes verán en la carta pública." value={settings.title} onChange={event => updateSettings({ title: event.target.value })} />
        <label>WhatsApp con código de país<DSInput type="tel" value={settings.whatsapp} onChange={event => updateSettings({ whatsapp: event.target.value })} placeholder="+51 999 888 777" /></label>
        <DSInput label="Frase de portada" info="Describe tu negocio en una frase. Por ejemplo: Alfajores artesanales del Valle Sagrado." value={settings.tagline} onChange={event => updateSettings({ tagline: event.target.value })} />
        <ProjectImageField label="Imagen de portada" value={settings.coverImage} onChange={value => updateSettings({ coverImage: value })} />
      </div>
      <div className="hero-editor">
        <ProjectImage value={settings.coverImage} alt="Portada del restaurante" />
        <div className="hero-editor-overlay"><h3>{settings.title}</h3><p>{settings.tagline}</p></div>
      </div>
    </DSCard>
    <DSCard as="section" id="restaurant-menu-edit" className="component-card">
      <div className="component-header"><h2 className="component-title">Productos de tu menú</h2><DSButtonSecondary type="button" onClick={() => { setDish(blankDish()); setMessage(''); }}>Nuevo producto</DSButtonSecondary></div>
      {dish && <form className="restaurant-form" onSubmit={submitDish}>
        <h3>{data.dishes.some(item => item.id === dish.id) ? 'Editar producto' : 'Agregar producto'}</h3>
        <label>Nombre<DSInput required value={dish.name} onChange={event => setDish({ ...dish, name: event.target.value })} /></label>
        <label>Precio (S/)<DSInput type="number" required min="0" step="0.01" value={Number.isFinite(dish.price) ? dish.price : ''} onChange={event => setDish({ ...dish, price: event.target.valueAsNumber })} /></label>
        <label>Categoría<DSInput required value={dish.category} onChange={event => setDish({ ...dish, category: event.target.value })} /></label>
        <label>Descripción<DSTextarea value={dish.description} onChange={event => setDish({ ...dish, description: event.target.value })} /></label>
        <ProjectImageField label="Imagen del plato" value={dish.image} onChange={value => setDish({ ...dish, image: value })} />
        <label className="restaurant-check"><DSInput type="checkbox" checked={dish.available} onChange={event => setDish({ ...dish, available: event.target.checked })} />Disponible para pedir</label>
        <div className="restaurant-actions"><DSButtonPrimary className="btn-primary" type="submit">Aplicar producto</DSButtonPrimary><DSButtonSecondary type="button" onClick={() => setDish(null)}>Cancelar</DSButtonSecondary></div>
      </form>}
      <div className="menu-grid">{data.dishes.map(item => <DSCard as="article" className="dish-card" key={item.id}>
        <ProjectImage value={item.image} alt={item.name} />
        <div className="dish-card-body"><h3>{item.name}</h3><p>{item.category}</p><p>{item.description}</p><strong className="dish-card-price">S/ {item.price.toFixed(2)}</strong><p>{item.available ? 'Disponible' : 'No disponible'}</p>
          <DSButtonSecondary type="button" onClick={() => { setDish({ ...item }); setMessage(''); }}>Editar {item.name}</DSButtonSecondary>
        </div>
      </DSCard>)}</div>
      {!data.dishes.length && <p>Agrega tu primer plato para empezar la carta.</p>}
    </DSCard>
    <details className="restaurant-advanced"><summary>Más opciones: historia, secciones y preguntas frecuentes</summary>
    <DSCard as="section" className="component-card">
      <h2 className="component-title">Secciones del menú</h2>
      <div className="sections-list">{data.sections.map((section, index) => <div key={section.id} className="section-item">
        <label className="restaurant-check"><DSInput type="checkbox" checked={section.visible} onChange={() => onChange({ ...data, sections: data.sections.map(item => item.id === section.id ? { ...item, visible: !item.visible } : item) })} />{section.title}</label>
        <div className="restaurant-actions">
          <DSButtonSecondary type="button" disabled={index === 0} aria-label={`Subir ${section.title}`} onClick={() => onChange(moveSection(data, section.id, -1))}>↑</DSButtonSecondary>
          <DSButtonSecondary type="button" disabled={index === data.sections.length - 1} aria-label={`Bajar ${section.title}`} onClick={() => onChange(moveSection(data, section.id, 1))}>↓</DSButtonSecondary>
        </div>
      </div>)}</div>
    </DSCard>
    <DSCard as="section" className="component-card restaurant-fields">
      <h2 className="component-title">Conócenos, ubicación y fidelización</h2>
      <label>Tu historia<DSTextarea value={settings.about} onChange={event => updateSettings({ about: event.target.value })} /></label>
      <label>Dirección<DSInput value={settings.address} onChange={event => updateSettings({ address: event.target.value })} /></label>
      <label>Horario<DSInput value={settings.hours} onChange={event => updateSettings({ hours: event.target.value })} /></label>
      
      <label>Beneficio para clientes frecuentes<DSTextarea value={settings.loyalty} onChange={event => updateSettings({ loyalty: event.target.value })} /></label>
    </DSCard>
    <DSCard as="section" className="component-card">
      <h2 className="component-title">Preguntas frecuentes</h2>
      {settings.faq.map(item => <fieldset key={item.id} className="restaurant-fields">
        <legend>Pregunta frecuente</legend>
        <label>Pregunta<DSInput value={item.question} onChange={event => updateSettings({ faq: settings.faq.map(row => row.id === item.id ? { ...row, question: event.target.value } : row) })} /></label>
        <label>Respuesta<DSTextarea value={item.answer} onChange={event => updateSettings({ faq: settings.faq.map(row => row.id === item.id ? { ...row, answer: event.target.value } : row) })} /></label>
        <DSButtonSecondary type="button" onClick={() => updateSettings({ faq: settings.faq.filter(row => row.id !== item.id) })}>Eliminar pregunta</DSButtonSecondary>
      </fieldset>)}
      <DSButtonSecondary type="button" onClick={() => updateSettings({ faq: [...settings.faq, { id: crypto.randomUUID(), question: '', answer: '' }] })}>Agregar pregunta</DSButtonSecondary>
    </DSCard>
    </details>
  </div>;
}
