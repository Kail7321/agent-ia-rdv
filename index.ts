// Fichier : supabase/functions/chat-agent/index.ts
// Cette fonction tourne sur les serveurs Supabase (pas dans le navigateur du visiteur) :
// ta clé API Anthropic reste secrète, jamais exposée publiquement.

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: messages,
      }),
    });
    const data = await res.json();
    const text = data?.content?.[0]?.text || "Désolé, je n'ai pas pu répondre.";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ text: "Erreur serveur, réessayez." }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
