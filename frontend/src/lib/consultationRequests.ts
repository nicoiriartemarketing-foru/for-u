import { isSupabaseConfigured, supabase } from './supabase';

export type ConsultationRequestInput = {
  fullName: string;
  businessName: string;
  instagramHandle: string;
  email: string;
  phoneWhatsapp: string;
  businessType: string;
  goal: string;
  appointmentDate: string;
  appointmentTime: string;
  planInterest: string;
};

export type ConsultationRequestRecord = {
  id: string;
  full_name: string;
  business_name: string | null;
  instagram_handle: string | null;
  email: string | null;
  phone_whatsapp: string | null;
  business_type: string | null;
  goal: string;
  appointment_date: string;
  appointment_time: string;
  plan_interest: string | null;
  status: string;
  created_at: string;
};

const localStorageKey = 'foru:consultation-requests';

export function buildWhatsappConfirmationUrl(input: ConsultationRequestInput) {
  const foruWhatsapp = import.meta.env.VITE_FORU_WHATSAPP_NUMBER;
  const message = [
    'Hola FOR U, quiero confirmar mi cita de diagnostico.',
    '',
    `Nombre: ${input.fullName.trim()}`,
    input.phoneWhatsapp.trim() ? `WhatsApp: ${input.phoneWhatsapp.trim()}` : '',
    input.businessName.trim() ? `Negocio: ${input.businessName.trim()}` : '',
    input.instagramHandle.trim() ? `Instagram: ${input.instagramHandle.trim()}` : '',
    input.email.trim() ? `Email: ${input.email.trim()}` : '',
    `Fecha: ${input.appointmentDate}`,
    `Hora: ${input.appointmentTime}`,
    `Plan: ${input.planInterest}`,
    `Objetivo: ${input.goal.trim()}`,
  ].filter(Boolean).join('\n');

  const phonePath = foruWhatsapp ? `/${foruWhatsapp}` : '';

  return `https://wa.me${phonePath}?text=${encodeURIComponent(message)}`;
}

export async function saveConsultationRequest(input: ConsultationRequestInput) {
  const payload = {
    full_name: input.fullName.trim(),
    business_name: input.businessName.trim() || null,
    instagram_handle: input.instagramHandle.trim() || null,
    email: input.email.trim() || null,
    phone_whatsapp: input.phoneWhatsapp.trim() || null,
    business_type: input.businessType.trim() || null,
    goal: input.goal.trim(),
    appointment_date: input.appointmentDate,
    appointment_time: input.appointmentTime,
    plan_interest: input.planInterest,
    status: 'scheduled',
    metadata: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      path: typeof window !== 'undefined' ? window.location.pathname : null,
    },
  };

  if (!isSupabaseConfigured || !supabase) {
    const localRequests = JSON.parse(localStorage.getItem(localStorageKey) ?? '[]');
    localRequests.unshift({ ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    localStorage.setItem(localStorageKey, JSON.stringify(localRequests.slice(0, 40)));

    return { savedRemote: false, reason: 'supabase_not_configured' };
  }

  const { error } = await supabase.from('consultation_requests').insert(payload);

  if (error) {
    console.warn('No se pudo guardar la solicitud de cita:', error.message);
    return { savedRemote: false, reason: error.message };
  }

  return { savedRemote: true };
}

export function loadLocalConsultationRequests(): ConsultationRequestRecord[] {
  try {
    return JSON.parse(localStorage.getItem(localStorageKey) ?? '[]');
  } catch {
    return [];
  }
}

export async function loadConsultationRequests() {
  const localRequests = loadLocalConsultationRequests();

  if (!isSupabaseConfigured || !supabase) {
    return { requests: localRequests, source: 'local' as const, error: null };
  }

  const { data, error } = await supabase
    .from('consultation_requests')
    .select('id, full_name, business_name, instagram_handle, email, phone_whatsapp, business_type, goal, appointment_date, appointment_time, plan_interest, status, created_at')
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (error) {
    return { requests: localRequests, source: 'local' as const, error: error.message };
  }

  return { requests: data ?? [], source: 'remote' as const, error: null };
}
