// functions/painel.js

// Trata GET e POST no mesmo handler
export async function onRequest({ request, env }) {
  try {
    // Sua lógica de busca dos dados
    const data = await getMetricsFromDB();  

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}
