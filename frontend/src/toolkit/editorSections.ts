import type { LandingBlock } from './types';
export type SectionPreset = { key: string; title: string; description: string; body: string };
const common: SectionPreset[] = [
 { key: 'story', title: 'Nuestra historia', description: 'Presenta a las personas detrás del negocio.', body: 'Cuenta cómo empezó tu negocio y qué te inspira.' },
 { key: 'faq', title: 'Preguntas frecuentes', description: 'Aclara las dudas antes de recibir una solicitud.', body: 'Escribe una pregunta frecuente y su respuesta.' },
];
const byIndustry: Record<string, { name: string; sections: SectionPreset[] }> = {
 restaurant: { name: 'Restaurante', sections: [{ key: 'menu', title: 'Nuestro menú', description: 'Destaca platos, ingredientes y opciones.', body: 'Presenta tus especialidades e indica los ingredientes que tus clientes deben conocer.' }, { key: 'delivery', title: 'Pedidos y entregas', description: 'Explica cómo pedir y dónde entregas.', body: 'Indica horarios, zonas de entrega y opciones de recojo.' }] },
 ecommerce: { name: 'Tienda', sections: [{ key: 'catalog', title: 'Nuestros productos', description: 'Presenta tu catálogo y sus beneficios.', body: 'Describe tus productos, variantes y qué incluye cada compra.' }, { key: 'shipping', title: 'Envíos y cambios', description: 'Aclara los plazos y condiciones de compra.', body: 'Indica costos y tiempos de envío y cómo solicitar un cambio.' }] },
 hospitality: { name: 'Hospedaje', sections: [{ key: 'rooms', title: 'Habitaciones y servicios', description: 'Explica capacidad, comodidades y opciones.', body: 'Describe las habitaciones, su capacidad y los servicios incluidos.' }, { key: 'arrival', title: 'Tu llegada', description: 'Ayuda a preparar la estadía.', body: 'Indica ubicación, horarios de entrada y salida y cómo consultar disponibilidad.' }] },
 tourism: { name: 'Turismo', sections: [{ key: 'itinerary', title: 'Tu experiencia paso a paso', description: 'Presenta el recorrido y su duración.', body: 'Describe las paradas, duración y punto de encuentro de la experiencia.' }, { key: 'included', title: 'Qué incluye y qué llevar', description: 'Prepara a tus visitantes.', body: 'Detalla lo incluido, recomendaciones y requisitos para participar.' }] },
 courses: { name: 'Cursos', sections: [{ key: 'syllabus', title: 'Lo que vas a aprender', description: 'Organiza los temas y resultados esperados.', body: 'Presenta el temario, duración y conocimientos que practicarán tus estudiantes.' }, { key: 'enrollment', title: 'Inscripciones y modalidad', description: 'Explica cómo participar.', body: 'Indica fechas, modalidad, requisitos y cómo consultar por una vacante.' }] },
};
export function editorIndustry(industry: string) {
 const key = industry === 'gastronomy' ? 'restaurant' : industry === 'shop' ? 'ecommerce' : industry === 'education' ? 'courses' : industry;
 return byIndustry[key] ?? { name: 'Servicios', sections: [{ key: 'offer', title: 'Nuestros servicios', description: 'Explica qué ofreces y cómo solicitarlo.', body: 'Describe tus servicios y el siguiente paso para conocer más.' }] };
}
export function sectionPresets(industry: string): SectionPreset[] { return [...editorIndustry(industry).sections, ...common]; }
export function createEditorSection(industry: string, key: string): LandingBlock | null {
 const preset = sectionPresets(industry).find(item => item.key === key);
 return preset ? { id: crypto.randomUUID(), title: preset.title, body: preset.body } : null;
}
export function reorderEditorSections(blocks: LandingBlock[], fromId: string, toId: string): LandingBlock[] {
 const from = blocks.findIndex(block => block.id === fromId), to = blocks.findIndex(block => block.id === toId);
 if (from < 0 || to < 0 || from === to) return blocks;
 const next = [...blocks]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next;
}
