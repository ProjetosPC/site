// functions/painel.js

/**
 * Aqui você conecta no seu banco (KV, D1, R2, API externa, etc).
 * No exemplo abaixo eu retorno um objeto estático apenas para demonstrar.
 */
async function getMetricsFromDB() {
  return {
    diarios_hoje:                5,
    check_hoje:                  3,
    nao_atendidas_total:         8,
    medicoes_nao_medidas_total:  2,

    diarios_mes:                 120,
    check_mes:                   95,
    atendidos_mes:               80,
    medidos_mes:                 70,

    obras_unicas_mes:            25,
    erros_reportados_mes:        4,
    requisicoes_criadas_mes:     12,
    medicoes_criadas_mes:        15,

    cidades_unicas_mes:          7,
    km_rodados_mes:              1500,
    tempo_medio_dias:            1.8,
    medicoes_diferentes_mes:     10
  };
}

export async function onRequest({ request, env }) {
  try {
    // chama sua função de acesso a dados
    const data = await getMetricsFromDB();

    // devolve JSON que o seu script.js espera
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
