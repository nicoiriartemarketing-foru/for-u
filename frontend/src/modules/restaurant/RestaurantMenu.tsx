import ProjectImage from '../../components/shared/ProjectImage';
import { useState } from 'react';
import { whatsappOrderUrl } from './model';
import type { RestaurantMenuData } from './publicMenu';

/** Customer-facing menu; the editor supplies the current draft for preview. */
export default function RestaurantMenu({ data }: { data: RestaurantMenuData }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [category, setCategory] = useState('');
  const { settings } = data;
  const available = data.dishes.filter(dish => dish.available);
  const categories = [...new Set(available.map(dish => dish.category))];
  const lines = available.filter(dish => quantities[dish.id] > 0).map(dish => ({ dish, quantity: quantities[dish.id] }));
  const total = lines.reduce((sum, line) => sum + Math.round(line.dish.price * 100) * line.quantity, 0) / 100;
  let orderUrl = '';
  let orderError = '';
  if (lines.length) {
    try { orderUrl = whatsappOrderUrl(settings.whatsapp, lines); }
    catch (error) { orderError = (error as Error).message; }
  }
  return <div className="restaurant-menu-preview">
    {data.sections.filter(section => section.visible).map(section => <section key={section.id} className="component-card" aria-label={section.title}>
      {section.id === 'hero' && <><h2>{settings.title}</h2><p>{settings.tagline}</p><ProjectImage className="restaurant-menu-cover" value={settings.coverImage} alt={settings.title} /></>}
      {section.id === 'menu' && <><h2>Menú</h2><label>Categoría<select value={categories.includes(category) ? category : ''} onChange={event => setCategory(event.target.value)}><option value="">Todas</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
        <div className="menu-grid">{available.filter(dish => !categories.includes(category) || dish.category === category).map(dish => <article className="dish-card" key={dish.id}>
          <ProjectImage value={dish.image} alt={dish.name} />
          <div className="dish-card-body"><h3>{dish.name}</h3><p>{dish.description}</p><strong>S/ {dish.price.toFixed(2)}</strong><label>Cantidad de {dish.name}<input type="number" min="0" max="99" step="1" value={quantities[dish.id] ?? 0} onChange={event => { const value = event.target.valueAsNumber; setQuantities(previous => ({ ...previous, [dish.id]: Number.isFinite(value) ? Math.max(0, Math.min(99, Math.floor(value))) : 0 })); }} /></label></div>
        </article>)}</div>{!available.length && <p>La carta se está preparando.</p>}
        {lines.length > 0 && <aside aria-label="Tu pedido"><h3>Tu pedido</h3><ul>{lines.map(line => <li key={line.dish.id}>{line.quantity} × {line.dish.name} · S/ {(Math.round(line.dish.price * 100) * line.quantity / 100).toFixed(2)}</li>)}</ul><strong>Total: S/ {total.toFixed(2)}</strong><p>El restaurante confirma disponibilidad, entrega y pago por WhatsApp.</p>{orderError ? <p role="alert">{orderError}</p> : <a href={orderUrl} target="_blank" rel="noopener noreferrer">Revisar pedido en WhatsApp</a>}<button type="button" onClick={() => setQuantities({})}>Vaciar pedido</button></aside>}
      </>}
      {section.id === 'about' && <><h2>Conócenos</h2><p>{settings.about}</p></>}
      {section.id === 'faq' && <><h2>Preguntas frecuentes</h2>{settings.faq.filter(item => item.question.trim()).map(item => <details key={item.id}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</>}
      {section.id === 'location' && <><h2>Visítanos</h2><p>{settings.address}</p><p>{settings.hours}</p>{settings.address.trim() && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`} target="_blank" rel="noopener noreferrer">Ver ubicación</a>}</>}
      {section.id === 'loyalty' && <><h2>Para nuestros clientes frecuentes</h2><p>{settings.loyalty}</p></>}
    </section>)}
  </div>;
}
