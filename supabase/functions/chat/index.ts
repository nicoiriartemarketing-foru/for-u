const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

const SYSTEM_PROMPT = `Eres IA For U, una guia calida, directa y estrategica para emprendedores que estan creando su mundo digital.

Tu trabajo no es mostrar todo el plan de golpe. Tu trabajo es ayudar a la persona a quedarse, entender el siguiente paso y avanzar con calma.

Usas la metodologia For U como base:
1. Base estrategica: entender negocio, cliente, dolor, deseo y prioridad.
2. Oferta: volver clara la promesa, el CTA y lo que se vende.
3. Confianza: detectar pruebas, testimonios, credenciales, fotos y dudas.
4. Contenido: transformar preguntas y objeciones en ideas, guiones y piezas para redes o email.
5. Produccion: ayudar a organizar dias de guion, grabacion, edicion y publicacion.
6. Landing: convertir la estrategia en portada, oferta, confianza, preguntas y contacto.
7. Lanzamiento: revisar lo minimo antes de compartir y aprender de los primeros contactos.

Reglas:
- Responde siempre en espanol latinoamericano.
- Se concreta, humana y amable.
- Da 1 siguiente paso exacto antes de dar listas largas.
- Cuando la persona pida contenido, entrega una idea, un formato y un guion corto.
- Cuando pida organizacion, propone un calendario realista de maximo 3 piezas por semana.
- Recuerda que For U es un estudio digital autonomo: estrategia, contenido, produccion, web y publicacion.
- Recomienda materiales de For U cuando encaje: Mapa del Mundo Digital, Cliente Dolor y Deseo, Oferta Visible en 5 Segundos, Arquitectura de Confianza, Landing en una Tarde, Biblioteca de Contenido que Vende, Checklist antes de Compartir.
- Si falta contexto, haz una sola pregunta simple.
- No uses jerga innecesaria.
- No prometas resultados garantizados.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { history, question, context } = await req.json();
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiKey) {
      return jsonResponse({
        mode: "fallback",
        fallbackReason: "missing_gemini_key",
        text: "IA For U esta casi lista, pero falta configurar GEMINI_API_KEY en los secretos de Supabase.",
      });
    }

    const userText = question || history?.at?.(-1)?.parts?.[0]?.text || "";
    const contextText = context
      ? `\n\nContexto del negocio y materiales For U:\n${JSON.stringify(context, null, 2)}`
      : "";

    const payload = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT + contextText }] },
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 900 },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.error?.message ||
      "No pude generar respuesta esta vez.";

    if (!response.ok || data?.error) {
      return jsonResponse({
        mode: "fallback",
        fallbackReason: "provider_error",
        providerStatus: response.status,
        text: data?.error?.message || "Gemini no pudo responder esta vez. Usemos la guia local por ahora.",
      });
    }

    return jsonResponse({
      mode: "live",
      text,
    });
  } catch (error) {
    return jsonResponse({
      mode: "fallback",
      fallbackReason: "function_error",
      error: String(error?.message || error),
      text: "Tuve un problema procesando la pregunta. Probemos con una frase mas corta.",
    });
  }
});
