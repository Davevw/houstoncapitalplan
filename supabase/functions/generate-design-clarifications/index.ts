// Generates 2-3 conversational clarification questions for a new ITPH design concept request
// Uses Lovable AI Gateway (no API key required from user)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { concept_name, description, priority_lots, target_client_type } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a senior master-planning strategist working on the ITPH project — a 136-acre, 30-lot mixed-use development at 12000 Bissonnet St, Houston, TX.

When a development principal proposes a new design concept, your job is to ask 2 to 3 thoughtful, advisory-level clarification questions that help shape the master plan scenario.

Tone: thoughtful, collaborative, strategic. Sound like a planning partner — not a form.
Avoid yes/no questions. Probe positioning, tenant strategy, lot prioritization, density tradeoffs, and value creation.

Return ONLY a valid JSON array of 2-3 strings. No markdown, no commentary. Example:
["You mentioned a retail-heavy configuration — should premium corner frontage prioritize restaurants, medical office, or destination retail?", "How much multifamily density should remain within the site plan?"]`;

    const userPrompt = `New design concept request:

Concept Name: ${concept_name}
Target Client Type: ${target_client_type}
Priority Lots: ${priority_lots || "(not specified)"}

Description:
${description}

Generate 2-3 clarification questions.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, errText);
      return new Response(JSON.stringify({ error: "AI request failed", detail: errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    const raw = aiData?.choices?.[0]?.message?.content ?? "[]";

    let questions: string[] = [];
    try {
      const cleaned = raw.replace(/```json\s*|\s*```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) questions = parsed.filter((q) => typeof q === "string");
    } catch (_e) {
      const matches = raw.match(/"([^"]{20,})"/g);
      if (matches) questions = matches.map((m: string) => m.replace(/^"|"$/g, "")).slice(0, 3);
    }

    if (questions.length === 0) {
      questions = [
        "Which lots or frontage corridors should be reserved for anchor users in this concept?",
        "What tenant mix do you envision driving long-term value creation here?",
        "How should this configuration balance visibility, access, and separation between uses?",
      ];
    }

    return new Response(JSON.stringify({ questions: questions.slice(0, 3) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Function error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
