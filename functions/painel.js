// functions/painel.js

import driveManager from "./driveManager.js";

//
// IDs das suas planilhas no Google Sheets
//
const DIARIO_ID     = "1fGPatmNV3j6gte7Txfas8d7WB0G8Yfxf1ivAOiJp3F4";
const REQ_ID        = "1I6WlaOI4JtBNkuHepSvFK772BnqWNS1QF7scEiPTMGU";
const MEDICAO_ID    = "1hfohcOgcZct09QrlkB6IEmDISrldOQcN6rpWduIBaac";

//
// Escopos de colunas
//
const diarioScope = { date: 2, name: 1 };
const veiculosScope = { date: 2, kmInicial: 10, kmFinal: 11 };
// (adicione mais índices aqui conforme precisar…)

const requisicaoScope = {
  dataSolicitacao: 3,
  status:          9,
  dataEntrega:     4
};

const medicaoScope = {
  dataSolicitacao: 3,
  status:          7,
  protocolo:       1
};

//
// Helpers de data
//
function parseDateDMY(str) {
  const [d, m, y] = (str || "").split("/");
  return new Date(+y, +m - 1, +d);
}
function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}
function countBetween(rows, col, start, end) {
  return rows.filter(r => {
    const dt = parseDateDMY(r[col]);
    return isValidDate(dt) && dt >= start && dt <= end;
  }).length;
}

export async function onRequest(context) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400e3);
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    // carrega as planilhas (incluindo cabeçalho)
    let [dSheet, vSheet, rSheet, mSheet] = await Promise.all([
      driveManager.getSheet(DIARIO_ID,  "DIÁRIO DE OBRAS"),
      driveManager.getSheet(DIARIO_ID,  "CHECKLIST DE VEÍCULOS"),
      driveManager.getSheet(REQ_ID,     "REQUISICAO DE MATERIAIS"),
      driveManager.getSheet(MEDICAO_ID, "MEDICAO DE OBRAS")
    ]);

    // remove cabeçalhos
    dSheet = dSheet.slice(1);
    vSheet = vSheet.slice(1);
    rSheet = rSheet.slice(1);
    mSheet = mSheet.slice(1);

    // métricas principais
    const diarios_mes  = countBetween(dSheet, diarioScope.date, firstOfMonth, now);
    const diarios_hoje = countBetween(dSheet, diarioScope.date, yesterday, now);
    const check_mes    = countBetween(vSheet, veiculosScope.date, firstOfMonth, now);
    const check_hoje   = countBetween(vSheet, veiculosScope.date, yesterday, now);

    // requisições de materiais
    const dfR   = rSheet.filter(r => {
      const dt = parseDateDMY(r[requisicaoScope.dataSolicitacao]);
      return isValidDate(dt) && dt >= firstOfMonth && dt <= now;
    });
    const requisicoes_criadas_mes   = dfR.length;
    const atendidos_mes              = dfR.filter(r => 
      r[requisicaoScope.status]?.toString().trim().toUpperCase()==="ATENDIDO"
    ).length;
    const nao_atendidas_total        = dfR.filter(r =>
      !r[requisicaoScope.status] ||
      r[requisicaoScope.status].toString().trim().toUpperCase()!=="ATENDIDO"
    ).length;
    let tempo_medio_dias = 0;
    {
      const diffs = dfR.map(r => {
        const s = parseDateDMY(r[requisicaoScope.dataSolicitacao]);
        const e = parseDateDMY(r[requisicaoScope.dataEntrega]);
        return isValidDate(s)&&isValidDate(e)
          ? (e - s)/86400e3
          : null;
      }).filter(x=>x!=null);
      if (diffs.length) {
        tempo_medio_dias = Math.round(diffs.reduce((a,b)=>a+b,0)/diffs.length);
      }
    }

    // medições de obras
    const dfM = mSheet.filter(r => {
      const dt = parseDateDMY(r[medicaoScope.dataSolicitacao]);
      return isValidDate(dt) && dt >= firstOfMonth && dt <= now;
    });
    const medicoes_criadas_mes       = dfM.length;
    const medidos_mes                = dfM.filter(r =>
      r[medicaoScope.status]?.toString().trim().toUpperCase()==="MEDIDO"
    ).length;
    const medicoes_nao_medidas_total = mSheet.filter(r =>
      !r[medicaoScope.status] ||
      r[medicaoScope.status].toString().trim().toUpperCase()!=="MEDIDO"
    ).length;
    const medicoes_diferentes_mes    = new Set(
      dfM.map(r => r[medicaoScope.protocolo]).filter(x=>x)
    ).size;

    // constrói o JSON de resposta
    const payload = {
      success: true,
      data: {
        diarios_mes,
        diarios_hoje,
        check_mes,
        check_hoje,
        atendidos_mes,
        nao_atendidas_total,
        requisicoes_criadas_mes,
        medidos_mes: medidos_mes,
        medicoes_nao_medidas_total,
        medicoes_criadas_mes,
        medicoes_diferentes_mes,
        tempo_medio_dias
        // adicione aqui qualquer outra métrica que precise
      }
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
