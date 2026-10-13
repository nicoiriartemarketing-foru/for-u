import { Input, ButtonSecondary } from '../../components/ui/DesignSystem';
import type { DishOption } from './orderOptions';
export default function DishOptionsEditor({ title, help, options = [], onChange }: { title: string; help: string; options?: DishOption[]; onChange: (options: DishOption[]) => void }) {
  return <details className="restaurant-options"><summary>{title}{options.length > 0 ? ` (${options.length})` : ''}</summary><p>{help}</p>
    {options.map((option, index) => <fieldset key={option.id}><legend>{title} · {index + 1}</legend>
      <Input label={`Nombre de ${title.toLowerCase()} ${index + 1}`} required maxLength={100} value={option.name} onChange={event => onChange(options.map(item => item.id === option.id ? { ...item, name: event.target.value } : item))} />
      <Input label={`Precio de ${title.toLowerCase()} ${index + 1} (S/)`} type="number" required min="0" max="1000000" step="0.01" value={Number.isFinite(option.price) ? option.price : ''} onChange={event => onChange(options.map(item => item.id === option.id ? { ...item, price: event.target.valueAsNumber } : item))} />
      <label><input type="checkbox" checked={option.available} onChange={event => onChange(options.map(item => item.id === option.id ? { ...item, available: event.target.checked } : item))} /> Disponible</label>
      <ButtonSecondary type="button" onClick={() => onChange(options.filter(item => item.id !== option.id))}>Quitar {option.name || 'opción'}</ButtonSecondary>
    </fieldset>)}
    <ButtonSecondary type="button" disabled={options.length >= 20} onClick={() => onChange([...options, { id: crypto.randomUUID(), name: '', price: 0, available: true }])}>Agregar {title.toLowerCase()}</ButtonSecondary>
  </details>;
}
