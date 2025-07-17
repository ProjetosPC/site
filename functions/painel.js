// functions/painel.js

import driveManager from '../driveManager.js';
import moment from 'moment';

/** Índices de colunas para cada planilha */
const diarioScope = {
  carimbo:       0, name:    1, date:    2, horaInicio:  3,
  horaTermino:   4, funcionarios: 5, descricao:6, caminhao: 7,
  potencia1:     8, CBraco1:  9, SBraco1: 10, potencia2: 11,
  CBraco2:      12, SBraco2: 13, potencia3:14, CBraco3:  15,
  SBraco3:      16
};

const veiculosScope = {
  carimbo:      0, horaInicio:  1, date:      2, horaTermino:   3,
  condutor:     4, placa:        5, veiculo:   6, anoModelo:     7,
  origem:       8, destino:      9, kmInicial:10, kmFinal:      11,
  observacao:  12, combustivelSaida:  63, combustivelChegada: 64
};

/** Quais colunas são flags TRUE/FALSE */
const veiculosBooleanScope = {
  farolEsquerdo:13, farolDireito:14, piscaEsquerdo:15, piscaDireito:16,
  lanternaEsquerda:17, lanternaDireita:18, luzFreio:19, luzPlaca:20,
  buzina:21, arCondicionado:22, retrovisorInterno:23, retrovisorEsquerdo:24,
  retrovisorDireito:25, oleoMotor:26, oleoHidraulico:27, aguaParabrisa:28,
  fluidoFreio:29, liquidoArrefecimento:30, limpadorParabrisa:31,
  vidrosLaterais:32, parabrisaTraseiro:33, parabrisaDianteiro:34,
  vidrosEletricos:35, radio:36, estofamentoBancos:37, tapetes:38,
  forroTeto:39, equipamentoSky:40, equipamentoMunk:41, giroflex:42,
  cestoSimples:43, cestoDuplo:44, escadaCentral:45, escadaFibra:46,
  cones:47, macaco:48, chaveRoda:49, indicadoresPainel:50, estepe:51,
  extintor:52, triangulo:53, limpeza:54, cintosSeguranca:55, bateria:56,
  chaveIgnicao:57, carroceria:58, documentoVeicular:59, discoTacografo:60,
  pastaAdministrativa:61, freio:62
};

/** Como chamar cada flag no frontend (nomes legíveis) */
const veiculosBooleanHeader = {
  farolEsquerdo:   "FAROL ESQUERDO",
  farolDireito:    "FAROL DIREITO",
  piscaEsquerdo:   "PISCA ESQUERDO",
  piscaDireito:    "PISCA DIREITO",
  lanternaEsquerda:"LANTERNA ESQUERDA",
  lanternaDireita: "LANTERNA DIREITA",
  luzFreio:        "LUZ DE FREIO",
  luzPlaca:        "LUZ DE PLACA",
  buzina:          "BUZINA",
  arCondicionado:  "AR CONDICONADO",
  retrovisorInterno:"RETROVISOR INTERNO",
  retrovisorEsquerdo:"RETROVISOR ESQUERDO",
  retrovisorDireito:"RETROVISOR DIREITO",
  oleoMotor:       "NÍVEL DE ÓLEO DO MOTOR",
  oleoHidraulico:  "NÍVEL DE ÓLEO HIDRÁULICO",
  aguaParabrisa:   "NÍVEL DE ÁGUA DO PARABRISA",
  fluidoFreio:     "NÍVEL DO FLUÍDO DE FREIO",
  liquidoArrefecimento:"NÍVEL DO LIQ. DE ARREFECIMENTO",
  limpadorParabrisa:"LIMPADOR DE PARABRISA",
  vidrosLaterais:  "VIDROS LATERAIS",
  parabrisaTraseiro:"PARABRISA TRASEIRO",
  parabrisaDianteiro:"PARABRISA DIANTEIRO",
  vidrosEletricos: "VIDROS ELÉTRICOS",
  radio:           "RÁDIO",
  estofamentoBancos:"ESTOFAMENTO/BANCOS",
  tapetes:         "TAPETES",
  forroTeto:       "FORRO DO TETO",
  equipamentoSky:  "EQUIPAMENTO SKY",
  equipamentoMunk: "EQUIPAMENTO MUNK",
  giroflex:        "GIROFLEX",
  cestoSimples:    "CESTO SIMPLES",
  cestoDuplo:      "CESTO DUPLO",
  escadaCentral:   "ESCADA CENTRAL",
  escadaFibra:     "ESCADA DE FIBRA",
  cones:           "CONES",
  macaco:          "MACACO",
  chaveRoda:       "CHAVE DE RODA",
  indicadoresPainel:"INDICADORES DE PAINEL",
  estepe:          "ESTEPE",
  extintor:        "EXTINTOR",
  triangulo:       "TRIÂNGULO",
  limpeza:         "LIMPEZA",
  cintosSeguranca: "CINTOS DE SEGURANÇA",
  bateria:         "BATERIA",
  chaveIgnicao:    "CHAVE DE IGNIÇÃO",
  carroceria:      "CARROCERIA",
  documentoVeicular:"DOCUMENTO VEÍCULAR",
  discoTacografo:  "DISCO DE TACÓGRAFO",
  pastaAdministrativa:"PASTA ADMINISTRATIVA",
  freio:           "FREIO"
};

/** Escopo das planilhas de requisição e medição */
const requisicaoScope = {
  requisicaoDeMateriaisScope: {
    carimbo: 0, protocolo:1, requisitante:2,
    dataSolicitacao:3, dataEntrega:4, filial:5,
    obra:6, tipo:7, material:8, status:9,
    documento:10, observacao:11, emailEnviado:12
  }
};

const medicaoScope = {
  medicaoDeObras: {
    carimbo:0, protocolo:1, requisitante:2,
    dataSolicitacao:3, filial:4, obra:5,
    numeroMedicao:6, status:7
  }
};

export async function onRequest({ request, env }) {
  try {
    const now        = moment();
    const startMonth = moment().startOf('month');
    const startDay   = moment().subtract(1, 'day').startOf('day');

    // Carrega as 4 planilhas em paralelo
    let [
      diarioSheet,
      veiculosSheet,
      requisicaoSheet,
      medicaoSheet
    ] = await Promise.all([
      driveManager.getSheet(env.DIARIO_DE_OBRAS_APP_ID, "DIÁRIO DE OBRAS"),
      driveManager.getSheet(env.DIARIO_DE_OBRAS_APP_ID, "CHECKLIST DE VEÍCULOS"),
      driveManager.getSheet(env.REQUISICAO_DE_MATERIAIS_ID, "REQUISICAO DE MATERIAIS"),
      driveManager.getSheet(env.MEDICAO_OBRAS_ID, "MEDICAO DE OBRAS")
    ]);

    // Remove cabeçalhos
    diarioSheet      = diarioSheet.slice(1);
    veiculosSheet    = veiculosSheet.slice(1);
    requisicaoSheet  = requisicaoSheet.slice(1);
    medicaoSheet     = medicaoSheet.slice(1);

    // Função utilitária para contar linhas num intervalo de datas
    const countPeriod = (data, dateCol, start, end) =>
      data.filter(row => {
        const dt = moment(row[dateCol], 'DD/MM/YYYY', true);
        return dt.isValid() && dt.isBetween(start, end, null, '[]');
      }).length;

    // Cálculo de métricas iniciais
    const diarios_mes                  = countPeriod(diarioSheet, diarioScope.date,  startMonth, now);
    const diarios_hoje                 = countPeriod(diarioSheet, diarioScope.date,  startDay,   now);
    const check_mes                    = countPeriod(veiculosSheet, veiculosScope.date, startMonth, now);
    const check_hoje                   = countPeriod(veiculosSheet, veiculosScope.date, startDay,   now);

    // Requisições de materiais
    const colSolicR    = requisicaoScope.requisicaoDeMateriaisScope.dataSolicitacao;
    const colStatusR   = requisicaoScope.requisicaoDeMateriaisScope.status;
    const colEntregaR  = requisicaoScope.requisicaoDeMateriaisScope.dataEntrega;

    const dfRMes          = requisicaoSheet.filter(row => {
      const dt = moment(row[colSolicR], 'DD/MM/YYYY', true);
      return dt.isValid() && dt.isBetween(startMonth, now, null, '[]');
    });
    const requisicoes_criadas_mes   = dfRMes.length;
    const atendidos_mes              = dfRMes.filter(r =>
      r[colStatusR] && r[colStatusR].toString().trim().toUpperCase()==='ATENDIDO'
    ).length;
    const nao_atendidas_total        = dfRMes.filter(r =>
      !r[colStatusR] || r[colStatusR].toString().trim().toUpperCase()!=='ATENDIDO'
    ).length;

    let tempo_medio_dias = 0;
    if (colEntregaR) {
      const diffs = dfRMes.map(r => {
        const s = moment(r[colSolicR], 'DD/MM/YYYY', true);
        const e = moment(r[colEntregaR], 'DD/MM/YYYY', true);
        return s.isValid() && e.isValid() ? e.diff(s,'days') : null;
      }).filter(x=>x!=null);
      if (diffs.length) tempo_medio_dias = Math.round(diffs.reduce((a,b)=>a+b,0)/diffs.length);
    }

    // Medições de obras
    const colSolicM      = medicaoScope.medicaoDeObras.dataSolicitacao;
    const colStatusM     = medicaoScope.medicaoDeObras.status;
    const protoCol       = medicaoScope.medicaoDeObras.protocolo;

    const dfMMes          = medicaoSheet.filter(row => {
      const dt = moment(row[colSolicM], 'DD/MM/YYYY', true);
      return dt.isValid() && dt.isBetween(startMonth, now, null, '[]');
    });
    const medicoes_criadas_mes       = dfMMes.length;
    const medidos_mes                 = dfMMes.filter(r =>
      r[colStatusM] && r[colStatusM].toString().trim().toUpperCase()==='MEDIDO'
    ).length;
    const medicoes_nao_medidas_total = medicaoSheet.filter(r =>
      !r[colStatusM] || r[colStatusM].toString().trim().toUpperCase()!=='MEDIDO'
    ).length;
    const medicoes_diferentes_mes    = protoCol
      ? new Set(dfMMes.map(r=>r[protoCol]).filter(x=>x)).size
      : 0;

    // Métricas extras
    const obras_unicas_mes = (() => {
      const setObras = new Set(
        diarioSheet.filter(r=>{
          const dt = moment(r[diarioScope.date], 'DD/MM/YYYY', true);
          return dt.isValid() && dt.isBetween(startMonth, now, null, '[]');
        }).map(r=>r[diarioScope.name]).filter(x=>x)
      );
      return setObras.size;
    })();

    const dfCMes             = veiculosSheet.filter(r=>{
      const dt = moment(r[veiculosScope.date], 'DD/MM/YYYY', true);
      return dt.isValid() && dt.isBetween(startMonth, now, null, '[]');
    });
    const erros_reportados_mes = dfCMes.reduce((cnt,row)=>{
      Object.values(row).forEach(v=>{
        if (v && v.toString().trim().toUpperCase()==='TRUE') cnt++;
      });
      return cnt;
    }, 0);

    const cidades_unicas_mes = (() => {
      const setCidades = new Set(
        diarioSheet.filter(r=>{
          const dt = moment(r[diarioScope.date], 'DD/MM/YYYY', true);
          return dt.isValid() && dt.isBetween(startMonth, now, null, '[]');
        }).map(r=>{
          const s = r[diarioScope.name];
          return s.slice(s.indexOf(' ')+1);
        }).filter(x=>x)
      );
      return setCidades.size;
    })();

    let km_rodados_mes = 0;
    if (veiculosScope.kmInicial!=null && veiculosScope.kmFinal!=null) {
      km_rodados_mes = Math.round(
        dfCMes.reduce((tot,r)=>{
          const i = parseFloat(r[veiculosScope.kmInicial])||0;
          const f = parseFloat(r[veiculosScope.kmFinal])||0;
          return tot + (f-i);
        },0)
      );
    }

    // Retorna tudo num JSON
    return new Response(JSON.stringify({
      success: true,
      data: {
        diarios_mes,
        diarios_hoje,
        check_mes,
        check_hoje,
        atendidos_mes,
        nao_atendidas_total,
        requisicoes_criadas_mes,
        medidos_mes,
        medicoes_nao_medidas_total,
        medicoes_criadas_mes,
        obras_unicas_mes,
        erros_reportados_mes,
        cidades_unicas_mes,
        km_rodados_mes,
        tempo_medio_dias,
        medicoes_diferentes_mes
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
