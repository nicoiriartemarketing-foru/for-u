import ProjectImage from '../../components/shared/ProjectImage';
import ProjectImageField from '../../components/shared/ProjectImageField';
import { useModuleDraft } from '../useModuleDraft';
import { useState, type FormEvent } from 'react';
import { saveProduct, type EcommerceData, type Product } from './model';
import './ecommerce.css';
export type EcommerceProps = { data: EcommerceData; onChange: (data: EcommerceData) => void };

export default function EcommerceEditor({ data, onChange }: EcommerceProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState('');
  useModuleDraft(!!product);
  function submit(event: FormEvent) {
    event.preventDefault(); if (!product) return;
    try { onChange(saveProduct(data, product)); setProduct(null); setMessage('Producto actualizado. Guarda los cambios de tu tienda.'); }
    catch (error) { setMessage((error as Error).message); }
  }
  return <div className="ecommerce-module"><h2>Catálogo y tienda</h2><p role="status">{message}</p>
    <section className="commerce-card commerce-form"><h3>Identidad de la tienda</h3><ProjectImageField label="Imagen de portada" value={data.settings.coverImage} onChange={value => onChange({ ...data, settings: { ...data.settings, coverImage: value } })} />
      {([['name', 'Nombre'], ['tagline', 'Frase de portada'], ['whatsapp', 'WhatsApp con código de país']] as const).map(([key, label]) => <label key={key}>{label}<input type={key === 'whatsapp' ? 'tel' : 'text'} value={data.settings[key]} onChange={event => onChange({ ...data, settings: { ...data.settings, [key]: event.target.value } })} /></label>)}
      {([['about', 'Sobre la tienda'], ['shipping', 'Entregas y envíos'], ['returns', 'Cambios y devoluciones']] as const).map(([key, label]) => <label key={key}>{label}<textarea value={data.settings[key]} onChange={event => onChange({ ...data, settings: { ...data.settings, [key]: event.target.value } })} /></label>)}
    </section>
    <section className="commerce-card"><div className="commerce-header"><h3>Productos</h3><button onClick={() => setProduct({ id: crypto.randomUUID(), name: '', category: '', description: '', image: '', price: 0, stock: 0, active: true })}>Nuevo producto</button></div>
      {!data.products.length && <p>Agrega tu primer producto con su precio y stock.</p>}
      <div className="commerce-grid">{data.products.map(item => <article className="commerce-product" key={item.id}>
        <ProjectImage value={item.image} alt={item.name} />
        <h3>{item.name}</h3><p>{item.category}</p><p>{item.description}</p><strong>S/ {item.price.toFixed(2)}</strong><p>{item.stock} disponibles · {item.active ? 'Visible' : 'Oculto'}</p><button onClick={() => setProduct({ ...item })}>Editar {item.name}</button>
      </article>)}</div>
    </section>
    {product && <form className="commerce-card commerce-form" onSubmit={submit}><h3>Datos del producto</h3>
      <label>Nombre del producto<input required value={product.name} onChange={event => setProduct({ ...product, name: event.target.value })} /></label>
      <label>Categoría<input value={product.category} onChange={event => setProduct({ ...product, category: event.target.value })} /></label>
      <label>Descripción<textarea value={product.description} onChange={event => setProduct({ ...product, description: event.target.value })} /></label>
      <label>Precio (S/)<input type="number" min="0" step="0.01" required value={Number.isFinite(product.price) ? product.price : ''} onChange={event => setProduct({ ...product, price: event.target.valueAsNumber })} /></label>
      <label>Stock disponible<input type="number" min="0" step="1" required value={Number.isFinite(product.stock) ? product.stock : ''} onChange={event => setProduct({ ...product, stock: event.target.valueAsNumber })} /></label>
      <ProjectImageField label="Imagen del producto" value={product.image} onChange={value => setProduct({ ...product, image: value })} />
      <label className="commerce-check"><input type="checkbox" checked={product.active} onChange={event => setProduct({ ...product, active: event.target.checked })} />Mostrar en catálogo</label>
      <div className="commerce-actions"><button type="submit">Guardar producto</button><button type="button" onClick={() => setProduct(null)}>Cancelar</button></div>
    </form>}
  </div>;
}
