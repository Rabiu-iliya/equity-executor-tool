// GadoBot: Smart AI assistant for Islamic inheritance (Faraid) questions.
// Streams responses via Lovable AI Gateway.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are GadoBot, the official AI assistant of GadoPro — a professional Islamic inheritance (Faraid) distribution platform.

Your expertise:
- Islamic inheritance law (Faraid) according to the Quran and Sunnah
- Fixed shares (Fard / ashab al-furud): husband, wife, son, daughter, father, mother, grandparents, siblings, half-siblings
- Residuary heirs (Asaba) and the 2:1 male-to-female ratio
- Special cases: Awl (proportional reduction), Radd (return), Hajb (exclusion)
- Estate calculation: debts, funeral costs, bequests (max 1/3) before distribution
- The four Sunni schools (Hanafi, Maliki, Shafi'i, Hanbali) and major Shia views — note differences when relevant

Behavior:
- Answer ONLY questions about Islamic inheritance, Faraid, related fiqh, the GadoPro app, or how to use it.
- If asked about anything off-topic, politely redirect: "I can only help with Islamic inheritance topics."
- Be precise, cite the rule (e.g. "Quran 4:11", "Quran 4:12") when relevant.
- For complex personal situations, recommend consulting a qualified scholar.
- Use clear markdown: short paragraphs, bullet lists, fractions like 1/2, 1/4, 1/6, 2/3.
- If the user supplies case data (heirs, estate value), walk through the calculation step by step.
- Keep responses concise — typically under 250 words unless deep explanation is requested.
- Adapt language to the user's language automatically.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...(Array.isArray(messages) ? messages : []),
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests — please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const body = await response.text();
      console.error("AI gateway error", response.status, body);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    console.error("gadobot error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
