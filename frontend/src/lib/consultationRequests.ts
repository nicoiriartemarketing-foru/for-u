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

export async function saveConsultationRequest(input: ConsultationRequestInput) {
  const payload = {
    full_name: input.fullName.trim(),
    business_name: input.businessName.trim() || null,
    instagram_handle: input.instagramHandle.trim() || null,
    email: input.email.trim() || null,
    phone_whatsapp: input.phoneWhatsapp.trim(),
    business_type: input.businessType.trim() || null,
    goal: input.goal.trim(),
    appointment_date: input.appointmentDate,
    appointment_time: input.appointmentTime,
    plan_interest: input.planInterest,
    metadata: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      path: typeof window !== 'undefined' ? window.location.pathname : null,
    },
  };

  if (!isSupabaseConfigured || !supabase) {
    const localRequests = JSON.parse(localStorage.getItem('foru:consultation-requests') ?? '[]');
    localRequests.unshift({ ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    localStorage.setItem('foru:consultation-requests', JSON.stringify(localRequests.slice(0, 40)));

    return { savedRemote: false, reason: 'supabase_not_configured' };
  }

  const { error } = await supabase.from('consultation_requests').insert(payload);

  if (error) {
    console.warn('No se pudo guardar la solicitud de cita:', error.message);
    return { savedRemote: false, reason: error.message };
  }

  return { savedRemote: true };
}
