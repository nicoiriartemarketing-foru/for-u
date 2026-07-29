import { createClient } from '@supabase/supabase-js';
import { handleWhatsAppFlow, normalizeText, type ProfileRow } from './flows';

type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
  end: () => void;
};

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  if (!supabase) {
    sendTwiml(res, 'For U todavía no tiene configuradas las llaves del servidor. Revisa SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
    return;
  }

  const payload = parseTwilioPayload(req.body);
  const from = normalizePhone(payload.From ?? '');
  const message = String(payload.Body ?? '').trim();

  if (!from || !message) {
    sendTwiml(res, 'No pude leer tu mensaje, pero sigo aquí contigo ✨');
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, whatsapp_number, whatsapp_enabled, coins')
    .eq('whatsapp_number', from)
    .eq('whatsapp_enabled', true)
    .maybeSingle<ProfileRow>();

  if (!profile) {
    sendTwiml(res, 'Hola 👋 Para usar For U por WhatsApp, primero entra a la app y conecta tu número en WhatsApp.');
    return;
  }

  const result = await handleWhatsAppFlow({ supabase, profile, message });

  await supabase.from('whatsapp_interactions').insert({
    user_id: profile.id,
    phone_number: from,
    message_in: message,
    message_out: result.response,
    intent: result.intent ?? normalizeText(message),
    state_at_time: result.state,
  });

  sendTwiml(res, result.response);
}

function parseTwilioPayload(body: unknown): Record<string, string> {
  if (!body) return {};
  if (typeof body === 'string') {
    return Object.fromEntries(new URLSearchParams(body));
  }
  if (body instanceof URLSearchParams) {
    return Object.fromEntries(body);
  }
  if (typeof body === 'object') {
    return Object.fromEntries(
      Object.entries(body as Record<string, unknown>).map(([key, value]) => [key, String(value ?? '')]),
    );
  }

  return {};
}

function normalizePhone(value: string) {
  const phone = value.replace(/^whatsapp:/i, '').replace(/[^\d+]/g, '');
  return phone.startsWith('+') ? phone : `+${phone}`;
}

function sendTwiml(res: VercelResponse, message: string) {
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.status(200).send(`<Response><Message>${escapeXml(message)}</Message></Response>`);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
