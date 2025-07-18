const express = require("express");
const bodyParser = require("body-parser");
const driveManager = require("./driveManager")
const moment = require('moment');

const app = express();
const path = require("path")

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
const diario_de_obras_app_id = "1fGPatmNV3j6gte7Txfas8d7WB0G8Yfxf1ivAOiJp3F4";
const requisicao_de_materiais_id = "1I6WlaOI4JtBNkuHepSvFK772BnqWNS1QF7scEiPTMGU";
const medicaoObras_id = "1hfohcOgcZct09QrlkB6IEmDISrldOQcN6rpWduIBaac";
const diario_page = "DIÁRIO DE OBRAS";
const veiculos_page = "CHECKLIST DE VEÍCULOS";
const requisicao_page = "REQUISICAO DE MATERIAIS";
const materiais_page = "MATERIAIS POR REQUISICAO";
const medicaoObras_page = "MEDICAO DE OBRAS";
const itensMedicao_page = "ITENS POR MEDICAO";

const diarioScope = {
    carimbo: 0,
    name: 1,
    date: 2,
    horaInicio: 3,
    horaTermino: 4,
    funcionarios: 5,
    descricao: 6,
    caminhao: 7,
    potencia1: 8,
    CBraco1: 9,
    SBraco1: 10,
    potencia2: 11,
    CBraco2: 12,
    SBraco2: 13,
    potencia3: 14,
    CBraco3: 15,
    SBraco3: 16
}

const veiculosScope = {
    carimbo: 0,
    horaInicio: 1,
    date: 2,
    horaTermino: 3,
    condutor: 4,
    placa: 5,
    veiculo: 6,
    anoModelo: 7,
    origem: 8,
    destino: 9,
    kmInicial: 10,
    kmFinal: 11,
    observacao: 12,
    combustivelSaida: 63,
    combustivelChegada: 64
}
const veiculosBooleanScope = {
    farolEsquerdo: 13,
    farolDireito: 14,
    piscaEsquerdo: 15,
    piscaDireito: 16,
    lanternaEsquerda: 17,
    lanternaDireita: 18,
    luzFreio: 19,
    luzPlaca: 20,
    buzina: 21,
    arCondicionado: 22,
    retrovisorInterno: 23,
    retrovisorEsquerdo: 24,
    retrovisorDireito: 25,
    oleoMotor: 26,
    oleoHidraulico: 27,
    aguaParabrisa: 28,
    fluidoFreio: 29,
    liquidoArrefecimento: 30,
    limpadorParabrisa: 31,
    vidrosLaterais: 32,
    parabrisaTraseiro: 33,
    parabrisaDianteiro: 34,
    vidrosEletricos: 35,
    radio: 36,
    estofamentoBancos: 37,
    tapetes: 38,
    forroTeto: 39,
    equipamentoSky: 40,
    equipamentoMunk: 41,
    giroflex: 42,
    cestoSimples: 43,
    cestoDuplo: 44,
    escadaCentral: 45,
    escadaFibra: 46,
    cones: 47,
    macaco: 48,
    chaveRoda: 49,
    indicadoresPainel: 50,
    estepe: 51,
    extintor: 52,
    triangulo: 53,
    limpeza: 54,
    cintosSeguranca: 55,
    bateria: 56,
    chaveIgnicao: 57,
    carroceria: 58,
    documentoVeicular: 59,
    discoTacografo: 60,
    pastaAdministrativa: 61,
    freio: 62
};
const requisicaoScope = {
    requisicaoDeMateriaisScope: {
        carimbo: 0,
        protocolo: 1,
        requisitante: 2,
        dataSolicitacao: 3,
        dataEntrega: 4,
        filial: 5,
        obra: 6,
        tipo: 7,
        material: 8,
        status: 9,
        documento: 10,
        observacao: 11,
        emailEnviado: 12
    },
    materiaisPorRequisicaoScope: {
        carimbo: 0,
        requisicaoN: 1,
        itemN: 2,
        descricaoMaterial: 3,
        unidade: 4,
        quantidade: 5,
        quantidadeAtendida: 6,
        dataAtendimento: 7
    }
}
const medicaoScope = {
    medicaoDeObras: {
        carimbo: 0,
        protocolo: 1,
        requisitante: 2,
        dataSolicitacao: 3,
        filial: 4,
        obra: 5,
        numeroMedicao: 6,
        status: 7
    },
    itensPorMedicao: {
        carimbo: 0,
        medicaoN: 1,
        itemN: 2,
        descricaoItem: 3,
        unidade: 4,
        quantidade: 5
    }
}
const veiculosBooleanHeader = {
    farolEsquerdo: "FAROL ESQUERDO",
    farolDireito: "FAROL DIREITO",
    piscaEsquerdo: "PISCA ESQUERDO",
    piscaDireito: "PISCA DIREITO",
    lanternaEsquerda: "LANTERNA ESQUERDA",
    lanternaDireita: "LANTERNA DIREITA",
    luzFreio: "LUZ DE FREIO",
    luzPlaca: "LUZ DE PLACA",
    buzina: "BUZINA",
    arCondicionado: "AR CONDICONADO",
    retrovisorInterno: "RETROVISOR INTERNO",
    retrovisorEsquerdo: "RETROVISOR ESQUERDO",
    retrovisorDireito: "RETROVISOR DIREITO",
    oleoMotor: "NÍVEL DE ÓLEO DO MOTOR",
    oleoHidraulico: "NÍVEL DE ÓLEO HIDRÁULICO",
    aguaParabrisa: "NÍVEL DE ÁGUA DO PARABRISA",
    fluidoFreio: "NÍVEL DO FLUÍDO DE FREIO",
    liquidoArrefecimento: "NÍVEL DO LIQ. DE ARREFECIMENTO",
    limpadorParabrisa: "LIMPADOR DE PARABRISA",
    vidrosLaterais: "VIDROS LATERAIS",
    parabrisaTraseiro: "PARABRISA TRASEIRO",
    parabrisaDianteiro: "PARABRISA DIANTEIRO",
    vidrosEletricos: "VIDROS ELÉTRICOS",
    radio: "RÁDIO",
    estofamentoBancos: "ESTOFAMENTO/BANCOS",
    tapetes: "TAPETES",
    forroTeto: "FORRO DO TETO",
    equipamentoSky: "EQUIPAMENTO SKY",
    equipamentoMunk: "EQUIPAMENTO MUNK",
    giroflex: "GIROFLEX",
    cestoSimples: "CESTO SIMPLES",
    cestoDuplo: "CESTO DUPLO",
    escadaCentral: "ESCADA CENTRAL",
    escadaFibra: "ESCADA DE FIBRA",
    cones: "CONES",
    macaco: "MACACO",
    chaveRoda: "CHAVE DE RODA",
    indicadoresPainel: "INDICADORES DE PAINEL",
    estepe: "ESTEPE",
    extintor: "EXTINTOR",
    triangulo: "TRIÂNGULO",
    limpeza: "LIMPEZA",
    cintosSeguranca: "CINTOS DE SEGURANÇA",
    bateria: "BATERIA",
    chaveIgnicao: "CHAVE DE IGNIÇÃO",
    carroceria: "CARROCERIA",
    documentoVeicular: "DOCUMENTO VEÍCULAR",
    discoTacografo: "DISCO DE TACÓGRAFO",
    pastaAdministrativa: "PASTA ADMINISTRATIVA",
    freio: "FREIO"
};


app.post("/painel", async(req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    try {
        const now = moment();
        const startMonth = moment().startOf('month');
        const startDay = moment().subtract(1, 'day').startOf('day');
        var [diarioSheet, veiculosSheet, requisicaoMateiraisSheet, medicaoObrasSheet] = await Promise.all([
            driveManager.getSheet(diario_de_obras_app_id, diario_page),
            driveManager.getSheet(diario_de_obras_app_id, veiculos_page),
            driveManager.getSheet(requisicao_de_materiais_id, requisicao_page),
            driveManager.getSheet(medicaoObras_id, medicaoObras_page)
        ]);
        diarioSheet = diarioSheet.slice(1);
        veiculosSheet = veiculosSheet.slice(1);
        requisicaoMateiraisSheet = requisicaoMateiraisSheet.slice(1);
        medicaoObrasSheet = medicaoObrasSheet.slice(1);
        let response = {
            success: true
        };
        function countPeriod(data, dateCol, start, end) {
            return data.filter(row => {
                var date = moment(row[dateCol], 'DD/MM/YYYY', true);
                return date.isValid() && date.isBetween(start, end, null, '[]');
            }).length;
        }
        var diariosMes = countPeriod(diarioSheet, diarioScope.date, startMonth, now);
        var diariosHoje = countPeriod(diarioSheet, diarioScope.date, startDay, now);
        var checkMes = countPeriod(veiculosSheet, veiculosScope.date, startMonth, now);
        var checkHoje = countPeriod(veiculosSheet, veiculosScope.date, startDay, now);

        // Requisições
        const colSolicR = requisicaoScope.requisicaoDeMateriaisScope.dataSolicitacao;
        const colStatusR = requisicaoScope.requisicaoDeMateriaisScope.status;
        const colEntregaR = requisicaoScope.requisicaoDeMateriaisScope.dataEntrega;

        let atendidosMes = 0;
        let naoAtendidasTotal = 0;
        let requisicoescriadasMes = 0;
        let tempoMedioDias = 0;

        if (colSolicR) {
            const dfRMes = requisicaoMateiraisSheet.filter(row => {
                const date = moment(row[colSolicR], 'DD/MM/YYYY', true);
                return date.isValid() && date.isBetween(startMonth, now, null, '[]');
            });
            
            requisicoescriadasMes = dfRMes.length;
            
            if (colStatusR) {
                atendidosMes = dfRMes.filter(row => 
                    row[colStatusR] && row[colStatusR].toString().trim().toUpperCase() === 'ATENDIDO'
                ).length;
                
                naoAtendidasTotal = diarioSheet.filter(row => 
                    !row[colStatusR] || row[colStatusR].toString().trim().toUpperCase() !== 'ATENDIDO'
                ).length;
            }

            if (colEntregaR) {
                const diffs = dfRMes
                    .map(row => {
                        const solicit = moment(row[colSolicR], 'DD/MM/YYYY', true);
                        const entrega = moment(row[colEntregaR], 'DD/MM/YYYY', true);
                        return solicit.isValid() && entrega.isValid() ? entrega.diff(solicit, 'days') : null;
                    })
                    .filter(diff => diff !== null);
                
                if (diffs.length > 0) {
                    tempoMedioDias = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
                }
            }
        }

        // Medições
        const colSolicM = medicaoScope.medicaoDeObras.dataSolicitacao;
        const colStatusM = medicaoScope.medicaoDeObras.status;
        const protoCol = medicaoScope.medicaoDeObras.protocolo;

        let medidosMes = 0;
        let medicoesCriadasMes = 0;
        let medicoesNaoMedidas = 0;
        let medicoesDiferentesMes = 0;

        if (colSolicM) {
            const dfMMes = medicaoObrasSheet.filter(row => {
                const date = moment(row[colSolicM], 'DD/MM/YYYY', true);
                return date.isValid() && date.isBetween(startMonth, now, null, '[]');
            });
            
            medicoesCriadasMes = dfMMes.length;
            
            if (colStatusM) {
                medidosMes = dfMMes.filter(row => 
                    row[colStatusM] && row[colStatusM].toString().trim().toUpperCase() === 'MEDIDO'
                ).length;
                
                medicoesNaoMedidas = medicaoObrasSheet.filter(row => 
                    !row[colStatusM] || row[colStatusM].toString().trim().toUpperCase() !== 'MEDIDO'
                ).length;
            }

            if (protoCol) {
                const protocolos = new Set(dfMMes.map(row => row[protoCol]).filter(p => p));
                medicoesDiferentesMes = protocolos.size;
            }
        }

        // Métricas extras
        const colObra = diarioScope.name;
        let obrasUnicasMes = 0;
        if (colObra) {
            const obras = new Set(
                diarioSheet.filter(row => {
                    const date = moment(row[diarioScope.date], 'DD/MM/YYYY', true);
                    return date.isValid() && date.isBetween(startMonth, now, null, '[]');
                }).map(row => row[colObra]).filter(obra => obra)
            );
            obrasUnicasMes = obras.size;
        }

        const dfCMes = veiculosSheet.filter(row => {
            const date = moment(row[veiculosScope.date], 'DD/MM/YYYY', true);
            return date.isValid() && date.isBetween(startMonth, now, null, '[]');
        });

        let errosReportadosMes = 0;
        dfCMes.forEach(row => {
            Object.values(row).forEach(value => {
                if (value && value.toString().trim().toUpperCase() === 'TRUE') {
                    errosReportadosMes++;
                }
            });
        });

        const colCidade = diarioScope.name;
        let cidadesUnicasMes = 0;
        if (colCidade) {
            var cidades = new Set();
            for (let obj of diarioSheet) {
                let date = moment(obj[diarioScope.date], 'DD/MM/YYYY', true);
                if (date.isValid() && date.isBetween(startMonth, now, null, '[]')) {
                    let cidadeNomeStr = obj[diarioScope.name];
                    let index = cidadeNomeStr.indexOf(' ')
                    let cidadeNome = cidadeNomeStr.slice(index + 1);
                    if (!cidades.has(cidadeNome)) cidades.add(cidadeNome);
                }
            }
            cidadesUnicasMes = cidades.size;
        }

        const kmInicialCol = veiculosScope.kmInicial;
        const kmFinalCol = veiculosScope.kmFinal;
        let kmRodadosMes = 0;
        if (kmInicialCol && kmFinalCol) {
            kmRodadosMes = dfCMes.reduce((total, row) => {
                const inicial = parseFloat(row[kmInicialCol]) || 0;
                const final = parseFloat(row[kmFinalCol]) || 0;
                return total + (final - inicial);
            }, 0);
            kmRodadosMes = Math.round(kmRodadosMes);
        }

        response.data = {
            diarios_mes: diariosMes,
            diarios_hoje: diariosHoje,
            check_mes: checkMes,
            check_hoje: checkHoje,
            atendidos_mes: atendidosMes,
            nao_atendidas_total: naoAtendidasTotal,
            requisicoes_criadas_mes: requisicoescriadasMes,
            medidos_mes: medidosMes,
            medicoes_nao_medidas_total: medicoesNaoMedidas,
            medicoes_criadas_mes: medicoesCriadasMes,
            obras_unicas_mes: obrasUnicasMes,
            erros_reportados_mes: errosReportadosMes,
            cidades_unicas_mes: cidadesUnicasMes,
            km_rodados_mes: kmRodadosMes,
            tempo_medio_dias: tempoMedioDias,
            medicoes_diferentes_mes: medicoesDiferentesMes
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servdor" })
    }
});

app.post("/diario", async(req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    var params = req.body;
    try {
        let data = (await driveManager.getSheet(diario_de_obras_app_id, diario_page)).slice(1);
        let response = {
            success: true
        };
        if (!params || !params.date && !params.name) {
            response.data = {};
            data.forEach((row) => {
                let date = row[diarioScope.date].split(" ")[0];
                if (response.data[date] === undefined) response.data[date] = [];
                response.data[date].push(row[diarioScope.name]);
            });
            return res.status(200).json(response);
        } else {
            if (params.date) {
                response.data = [];
                data.forEach((row) => {
                    if (row[diarioScope.date].split(" ")[0] === params.date && (!params.name || params.name === row[diarioScope.name])) {
                        let obj = JSONFromRowDiario(row);
                        response.data.push(obj);
                    }
                });
                return res.status(200).json(response);
            } else res.status(400).json({ error: "Informações incompletas" })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servdor" })
    }
});

app.post("/veiculos", async(req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    var params = req.body;
    try {
        let data = (await driveManager.getSheet(diario_de_obras_app_id, veiculos_page)).slice(1);
        let response = {
            success: true
        };
        if (!params || !params.date && !params.placa) {
            response.data = {};
            data.forEach((row) => {
                let date = row[veiculosScope.date].split(" ")[0];
                if (response.data[date] === undefined) response.data[date] = [];
                response.data[date].push(row[veiculosScope.placa]);
            });
            return res.status(200).json(response);
        } else {
            if (params.date) {
                response.data = [];
                data.forEach((row) => {
                    if (row[veiculosScope.date].split(" ")[0] === params.date && (!params.placa || params.placa === row[veiculosScope.placa])) {
                        let obj = JSONFromRowVeiculo(row);
                        Object.keys(veiculosBooleanScope).forEach((key) => {
                            if (row[veiculosBooleanScope[key]] === "TRUE") {
                                if (obj.booleans === undefined) obj.booleans = [];
                                obj.booleans.push(veiculosBooleanHeader[key]);
                            }
                        });
                        response.data.push(obj);
                    }
                });
                return res.status(200).json(response);
            } else res.status(400).json({ error: "Informações incompletas" })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servdor" })
    }
});

function JSONFromRowDiario(row) {
    let obj = {}
    for (let o of Object.keys(diarioScope)) {
        obj[o] = row[diarioScope[o]];
    }
    return obj;
}
function JSONFromRowVeiculo(row) {
    let obj = {}
    for (let o of Object.keys(veiculosScope)) {
        obj[o] = row[veiculosScope[o]];
    }
    return obj;
}

app.use('/diario/main', express.static(path.join(__dirname, "..", "Site/Diário de Obras/Main")));
app.use('/diario/date', express.static(path.join(__dirname, "..", "Site/Diário de Obras/Date")));
app.get('/diario', async (req, res) => {
    if (!req.query.date && !req.query.name) {
        return res.sendFile(path.join(__dirname, "..", "Site/Diário de Obras/Main/main.html"));
    } else {
        return res.sendFile(path.join(__dirname, "..", "Site/Diário de Obras/Date/main.html"));
    }
});

app.use('/veiculos/main', express.static(path.join(__dirname, "..", "Site/Checklist Veículos/Main")));
app.use('/veiculos/date', express.static(path.join(__dirname, "..", "Site/Checklist Veículos/Date")));
app.get('/veiculos', async(req, res) => {
    if (!req.query.date && !req.query.name) {
        return res.sendFile(path.join(__dirname, "..", "Site/Checklist Veículos/Main/main.html"));
    } else {
        return res.sendFile(path.join(__dirname, "..", "Site/Checklist Veículos/Date/main.html"));
    }
})

app.use('/painel', express.static(path.join(__dirname, "..", "Site/Painel de Gestão")));
app.get('/painel', async(req, res) => {
    return res.sendFile(path.join(__dirname, "..", "Site/Painel de Gestão/main.html"));
})

const PORT = 3030;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
