import { useState } from 'react';
import type { HospitalityProps } from './HospitalityDashboard';
import type { HospitalityData } from './model';
import './hospitality.css';

export default function HospitalityEditor({ data, onChange }: HospitalityProps) {
  const [selected, setSelected] = useState('hero');
  const [dragging, setDragging] = useState<string | null>(null);
  const settings = data.settings;
  function update(patch: Partial<HospitalityData['settings']>) { onChange({ ...data, settings: { ...settings, ...patch } }); }
  function move(id: string, target: number) {
    const index = data.sections.findIndex(section => section.id === id);
    if (index < 0 || target < 0 || target >= data.sections.length) return;
    const sections = [...data.sections]; const [section] = sections.splice(index, 1); sections.splice(target, 0, section);
    onChange({ ...data, sections });
  }
  return <div className="hospitality-module">
    <h2>Editor web de hospedaje</h2><p>Ordena las secciones y edita su contenido. La vista de abajo muestra los cambios del borrador.</p>
    <section className="component-card">
      <h3>Secciones de tu web</h3>
      {data.sections.map((section, index) => <div className="hospitality-section-row" key={section.id} draggable onDragStart={() => setDragging(section.id)} onDragEnd={() => setDragging(null)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (dragging) move(dragging, index); setDragging(null); }}>
        <label className="hospitality-check"><input type="checkbox" checked={section.visible} onChange={() => onChange({ ...data, sections: data.sections.map(item => item.id === section.id ? { ...item, visible: !item.visible } : item) })} />{section.title}</label>
        <div className="hospitality-actions"><button disabled={index === 0} aria-label={`Subir ${section.title}`} onClick={() => move(section.id, index - 1)}>↑</button><button disabled={index === data.sections.length - 1} aria-label={`Bajar ${section.title}`} onClick={() => move(section.id, index + 1)}>↓</button><button aria-pressed={selected === section.id} onClick={() => setSelected(section.id)}>Editar {section.title}</button></div>
      </div>)}
    </section>
    <section className="component-card hospitality-form">
      <h3>{data.sections.find(section => section.id === selected)?.title}</h3>
      {selected === 'hero' && <>
        <label>Nombre del hospedaje<input value={settings.name} onChange={event => update({ name: event.target.value })} /></label>
        <label>Frase de portada<input value={settings.tagline} onChange={event => update({ tagline: event.target.value })} /></label>
        <label>Imagen de portada URL<input type="url" value={settings.heroImage} onChange={event => update({ heroImage: event.target.value })} /></label>
      </>}
      {selected === 'about' && <label>Tu historia<textarea value={settings.about} onChange={event => update({ about: event.target.value })} /></label>}
      {selected === 'rooms' && <p>Las habitaciones se editan desde el panel de Habitaciones. Aquí se muestra su precio y sus comodidades.</p>}
      {selected === 'contact' && <>
        <label>Dirección<input value={settings.address} onChange={event => update({ address: event.target.value })} /></label>
        <label>WhatsApp con código de país<input type="tel" value={settings.whatsapp} onChange={event => update({ whatsapp: event.target.value })} /></label>
        <label>Correo de reservas<input type="email" value={settings.email} onChange={event => update({ email: event.target.value })} /></label>
        <label>Hora de entrada<input type="time" value={settings.checkIn} onChange={event => update({ checkIn: event.target.value })} /></label>
        <label>Hora de salida<input type="time" value={settings.checkOut} onChange={event => update({ checkOut: event.target.value })} /></label>
      </>}
      {selected === 'faq' && <>
        {settings.faqs.map(item => <fieldset key={item.id} className="hospitality-form"><legend>Pregunta frecuente</legend>
          <label>Pregunta<input value={item.question} onChange={event => update({ faqs: settings.faqs.map(row => row.id === item.id ? { ...row, question: event.target.value } : row) })} /></label>
          <label>Respuesta<textarea value={item.answer} onChange={event => update({ faqs: settings.faqs.map(row => row.id === item.id ? { ...row, answer: event.target.value } : row) })} /></label>
          <button onClick={() => update({ faqs: settings.faqs.filter(row => row.id !== item.id) })}>Eliminar pregunta</button>
        </fieldset>)}
        <button onClick={() => update({ faqs: [...settings.faqs, { id: crypto.randomUUID(), question: '', answer: '' }] })}>Agregar pregunta</button>
      </>}
      {selected === 'promotions' && <>
        {settings.promotions.map(item => <fieldset key={item.id} className="hospitality-form"><legend>Promoción</legend>
          <label>Título<input value={item.title} onChange={event => update({ promotions: settings.promotions.map(row => row.id === item.id ? { ...row, title: event.target.value } : row) })} /></label>
          <label>Descripción<textarea value={item.description} onChange={event => update({ promotions: settings.promotions.map(row => row.id === item.id ? { ...row, description: event.target.value } : row) })} /></label>
          <label className="hospitality-check"><input type="checkbox" checked={item.active} onChange={event => update({ promotions: settings.promotions.map(row => row.id === item.id ? { ...row, active: event.target.checked } : row) })} />Promoción activa</label>
          <button onClick={() => update({ promotions: settings.promotions.filter(row => row.id !== item.id) })}>Eliminar promoción</button>
        </fieldset>)}
        <button onClick={() => update({ promotions: [...settings.promotions, { id: crypto.randomUUID(), title: '', description: '', active: true }] })}>Agregar promoción</button>
      </>}
    </section>
    <h3>Vista previa del borrador</h3><div className="web-preview">{data.sections.filter(section => section.visible).map(section => <section className="web-section" key={section.id}>
      {section.id === 'hero' ? <><h2>{settings.name}</h2><p>{settings.tagline}</p>{/^https?:\/\//.test(settings.heroImage) && <img className="hospitality-hero-image" src={settings.heroImage} alt={settings.name} />}</> : <h2>{section.title}</h2>}
      {section.id === 'about' && <p>{settings.about}</p>}
      {section.id === 'rooms' && <div className="rooms-grid">{data.rooms.map(room => <article className="room-card room-info" key={room.id}><h3>{room.name}</h3><p>{room.capacity} personas · S/ {room.price.toFixed(2)} por noche</p><p>{room.amenities.join(' · ')}</p></article>)}</div>}
      {section.id === 'promotions' && settings.promotions.filter(item => item.active).map(item => <article key={item.id}><h3>{item.title}</h3><p>{item.description}</p></article>)}
      {section.id === 'faq' && settings.faqs.map(item => <details key={item.id}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
      {section.id === 'contact' && <><p>{settings.address}</p><p>{settings.email}</p><p>{settings.whatsapp}</p><p>Entrada: {settings.checkIn} · Salida: {settings.checkOut}</p></>}
    </section>)}</div>
  </div>;
}
