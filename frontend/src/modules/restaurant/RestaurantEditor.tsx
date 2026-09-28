import ProjectImage from '../../components/shared/ProjectImage';
import ProjectImageField from '../../components/shared/ProjectImageField';
import { useModuleDraft } from '../useModuleDraft';
import { useState, type FormEvent } from 'react';
import { moveSection, saveDish, type Dish, type RestaurantData } from './model';
import './restaurant.css';
import RestaurantMenu from './RestaurantMenu';

export type RestaurantEditorProps = {
  data: RestaurantData;
  onChange: (data: RestaurantData) => void;
};

const blankDish = (): Dish => ({ id: crypto.randomUUID(), name: '', description: '', price: 0, image: '', category: 'Platos', available: true });

export default function RestaurantEditor({ data, onChange }: RestaurantEditorProps) {
  const [dish, setDish] = useState<Dish | null>(null);
  const [message, setMessage] = useState('');
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
    <p role="status">{message}</p>
    <details className="component-card"><summary>Vista previa del menú para clientes</summary><p>Prueba la carta y el pedido antes de publicar. Esta vista todavía no es una dirección pública.</p><RestaurantMenu data={data} /></details>
    <section className="component-card">
      <h2 className="component-title">Portada principal</h2>
      <div className="restaurant-fields">
        <label>Nombre del restaurante<input value={settings.title} onChange={event => updateSettings({ title: event.target.value })} /></label>
        <label>Frase de portada<input value={settings.tagline} onChange={event => updateSettings({ tagline: event.target.value })} /></label>
        <ProjectImageField label="Imagen de portada" value={settings.coverImage} onChange={value => updateSettings({ coverImage: value })} />
      </div>
      <div className="hero-editor">
        <ProjectImage value={settings.coverImage} alt="Portada del restaurante" />
        <div className="hero-editor-overlay"><h3>{settings.title}</h3><p>{settings.tagline}</p></div>
      </div>
    </section>
    <section className="component-card">
      <h2 className="component-title">Secciones del menú</h2>
      <div className="sections-list">{data.sections.map((section, index) => <div key={section.id} className="section-item">
        <label className="restaurant-check"><input type="checkbox" checked={section.visible} onChange={() => onChange({ ...data, sections: data.sections.map(item => item.id === section.id ? { ...item, visible: !item.visible } : item) })} />{section.title}</label>
        <div className="restaurant-actions">
          <button type="button" disabled={index === 0} aria-label={`Subir ${section.title}`} onClick={() => onChange(moveSection(data, section.id, -1))}>↑</button>
          <button type="button" disabled={index === data.sections.length - 1} aria-label={`Bajar ${section.title}`} onClick={() => onChange(moveSection(data, section.id, 1))}>↓</button>
        </div>
      </div>)}</div>
    </section>
    <section className="component-card">
      <div className="component-header"><h2 className="component-title">Carta de platos</h2><button type="button" onClick={() => { setDish(blankDish()); setMessage(''); }}>Nuevo plato</button></div>
      {dish && <form className="restaurant-form" onSubmit={submitDish}>
        <h3>{data.dishes.some(item => item.id === dish.id) ? 'Editar plato' : 'Agregar plato'}</h3>
        <label>Nombre<input required value={dish.name} onChange={event => setDish({ ...dish, name: event.target.value })} /></label>
        <label>Precio (S/)<input type="number" required min="0" step="0.01" value={Number.isFinite(dish.price) ? dish.price : ''} onChange={event => setDish({ ...dish, price: event.target.valueAsNumber })} /></label>
        <label>Categoría<input required value={dish.category} onChange={event => setDish({ ...dish, category: event.target.value })} /></label>
        <label>Descripción<textarea value={dish.description} onChange={event => setDish({ ...dish, description: event.target.value })} /></label>
        <ProjectImageField label="Imagen del plato" value={dish.image} onChange={value => setDish({ ...dish, image: value })} />
        <label className="restaurant-check"><input type="checkbox" checked={dish.available} onChange={event => setDish({ ...dish, available: event.target.checked })} />Disponible para pedir</label>
        <div className="restaurant-actions"><button className="btn-primary" type="submit">Guardar plato</button><button type="button" onClick={() => setDish(null)}>Cancelar</button></div>
      </form>}
      <div className="menu-grid">{data.dishes.map(item => <article className="dish-card" key={item.id}>
        <ProjectImage value={item.image} alt={item.name} />
        <div className="dish-card-body"><h3>{item.name}</h3><p>{item.category}</p><p>{item.description}</p><strong className="dish-card-price">S/ {item.price.toFixed(2)}</strong><p>{item.available ? 'Disponible' : 'No disponible'}</p>
          <button type="button" onClick={() => { setDish({ ...item }); setMessage(''); }}>Editar {item.name}</button>
        </div>
      </article>)}</div>
      {!data.dishes.length && <p>Agrega tu primer plato para empezar la carta.</p>}
    </section>
    <section className="component-card restaurant-fields">
      <h2 className="component-title">Conócenos, ubicación y fidelización</h2>
      <label>Tu historia<textarea value={settings.about} onChange={event => updateSettings({ about: event.target.value })} /></label>
      <label>Dirección<input value={settings.address} onChange={event => updateSettings({ address: event.target.value })} /></label>
      <label>Horario<input value={settings.hours} onChange={event => updateSettings({ hours: event.target.value })} /></label>
      <label>WhatsApp con código de país<input type="tel" value={settings.whatsapp} onChange={event => updateSettings({ whatsapp: event.target.value })} placeholder="+51 999 888 777" /></label>
      <label>Beneficio para clientes frecuentes<textarea value={settings.loyalty} onChange={event => updateSettings({ loyalty: event.target.value })} /></label>
    </section>
    <section className="component-card">
      <h2 className="component-title">Preguntas frecuentes</h2>
      {settings.faq.map(item => <fieldset key={item.id} className="restaurant-fields">
        <legend>Pregunta frecuente</legend>
        <label>Pregunta<input value={item.question} onChange={event => updateSettings({ faq: settings.faq.map(row => row.id === item.id ? { ...row, question: event.target.value } : row) })} /></label>
        <label>Respuesta<textarea value={item.answer} onChange={event => updateSettings({ faq: settings.faq.map(row => row.id === item.id ? { ...row, answer: event.target.value } : row) })} /></label>
        <button type="button" onClick={() => updateSettings({ faq: settings.faq.filter(row => row.id !== item.id) })}>Eliminar pregunta</button>
      </fieldset>)}
      <button type="button" onClick={() => updateSettings({ faq: [...settings.faq, { id: crypto.randomUUID(), question: '', answer: '' }] })}>Agregar pregunta</button>
    </section>
  </div>;
}
