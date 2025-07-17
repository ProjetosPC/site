// script.js

// DEBUG: Verifica se o arquivo está sendo carregado
console.log("SCRIPT.JS carregado!");

const link_card_container = document.getElementById("link_card_container");
const cards_container = document.getElementById("cards_container");
let metricsData = {};

// Ajusta viewBox de quaisquer SVGs com <text>
function adjustAllSVGText() {
    let svgs = document.querySelectorAll('svg');
    for (let svg of svgs) {
        let text = svg.querySelector('text');
        if (text) {
            let bbox = text.getBBox();
            svg.setAttribute('viewBox', [bbox.x, bbox.y, bbox.width, bbox.height].join(' '));
        }
    }
}
adjustAllSVGText();

// Dispara ao terminar de carregar o DOM
document.addEventListener('DOMContentLoaded', function () {
    loadMetrics();
});

// Novo helper que usa GET em vez de POST
async function fetchMetrics(link) {
    console.log("[fetchMetrics] método=GET, url=", link);
    try {
        const response = await fetch(link);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
            alert(`Erro: ${data.error}`);
        }
        return data;
    } catch (error) {
        console.error("[fetchMetrics] erro:", error);
        alert("Não foi obtida resposta do servidor");
    }
}

async function loadMetrics() {
    showLoading(true);
    const res = await fetchMetrics('/painel');
    if (res && res.success) {
        metricsData = res.data;
        updateMetrics();
    }
    showLoading(false);
}

// Exibe ou oculta indicador de loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    const content = document.getElementById('main-content');
    if (show) {
        loading.style.display = '';
        content.style.display = 'none';
    } else {
        loading.style.display = 'none';
        content.style.display = '';
    }
}

// Formata números grandes
function formatNumber(value) {
    if (typeof value === 'number' && value > 999) {
        return value.toLocaleString('pt-BR');
    }
    return value;
}

// Atualiza todos os valores na página
function updateMetrics() {
    updateElement('diarios-hoje', metricsData.diarios_hoje);
    updateElement('check-hoje', metricsData.check_hoje);
    updateElement('nao-atendidas-total', metricsData.nao_atendidas_total);
    updateElement('medicoes-nao-medidas-total', metricsData.medicoes_nao_medidas_total);

    updateElement('diarios-mes', formatNumber(metricsData.diarios_mes));
    updateElement('check-mes', formatNumber(metricsData.check_mes));
    updateElement('atendidos-mes', formatNumber(metricsData.atendidos_mes));
    updateElement('medidos-mes', formatNumber(metricsData.medidos_mes));

    updateElement('obras-unicas-mes', formatNumber(metricsData.obras_unicas_mes));
    updateElement('erros-reportados-mes', formatNumber(metricsData.erros_reportados_mes));
    updateElement('requisicoes-criadas-mes', formatNumber(metricsData.requisicoes_criadas_mes));
    updateElement('medicoes-criadas-mes', formatNumber(metricsData.medicoes_criadas_mes));

    updateElement('cidades-unicas-mes', formatNumber(metricsData.cidades_unicas_mes));
    updateElement('km-rodados-mes', formatNumber(metricsData.km_rodados_mes));
    updateElement('tempo-medio-dias', formatNumber(metricsData.tempo_medio_dias));
    updateElement('medicoes-diferentes-mes', formatNumber(metricsData.medicoes_diferentes_mes));
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value || '0';
    }
}

// Função para recarregar dados manualmente
function refreshData() {
    loadMetrics();
}

// Cria cards de link
function createLinkCard(name, link, classes, txt, id) {
    let card = document.createElement("a");
    card.setAttribute("class", "card white_card");
    card.href = link;
    if (classes) {
        let i = document.createElement("i");
        i.setAttribute("class", "card_icon fas " + classes);
        card.appendChild(i);
    }
    let elName = document.createElement("div");
    elName.setAttribute("class", "card_name card_element");
    elName.textContent = name;
    card.appendChild(elName);

    let info = document.createElement("div");
    info.setAttribute("class", "card_info card_element");
    let dv = document.createElement("div");
    dv.textContent = "0";
    if (id) dv.setAttribute("id", id);
    info.appendChild(dv);
    info.innerHTML += ` ${txt}`;
    card.appendChild(info);

    let acess = document.createElement("div");
    acess.setAttribute("class", "card_acessar");
    acess.textContent = "ACESSAR";
    card.appendChild(acess);

    link_card_container.appendChild(card);
}

// Cria cards de dados
function createDataCard(name, txt, id) {
    let card = document.createElement("section");
    card.setAttribute("class", "card");

    let elName = document.createElement("div");
    elName.setAttribute("class", "card_name card_element");
    elName.textContent = name;
    card.appendChild(elName);

    let info = document.createElement("div");
    info.setAttribute("class", "card_info card_element");
    info.textContent = "0";
    if (id) info.setAttribute("id", id);
    card.appendChild(info);

    let text = document.createElement("div");
    text.setAttribute("class", "card_element card_text");
    text.textContent = txt;
    card.appendChild(text);

    cards_container.appendChild(card);
}

// Inicialização dos cards
createLinkCard("DIÁRIO DE OBRAS", "/diario", "fa-book", "enviados ontem", "diarios-hoje");
createLinkCard("CHECKLIST DE VEÍCULOS", "/veiculos", "fa-car", "enviados ontem", "check-hoje");
createLinkCard("REQUISIÇÕES DE MATERIAIS", "/requisicoes", "fa-box", "pendentes", "nao-atendidas-total");
createLinkCard("MEDIÇÕES DE OBRAS", "/medicoes", "fa-ruler-combined", "pendentes", "medicoes-nao-medidas-total");

createDataCard("DIÁRIOS", "Mês atual", "diarios-mes");
createDataCard("CHECKLISTS", "Mês atual", "check-mes");
createDataCard("REQUISIÇÕES ATENDIDAS", "Mês atual", "atendidos-mes");
createDataCard("MEDIÇÕES ATENDIDAS", "Mês atual", "medidos-mes");
createDataCard("OBRAS", "Mês atual", "obras-unicas-mes");
createDataCard("MANUTENÇÕES REPORTADAS", "Mês atual", "erros-reportados-mes");
createDataCard("REQUISIÇÕES RECEBIDAS", "Mês atual", "requisicoes-criadas-mes");
createDataCard("MEDIÇÕES RECEBIDAS", "Mês atual", "medicoes-criadas-mes");
createDataCard("CIDADES", "Mês atual", "cidades-unicas-mes");
createDataCard("KM RODADOS", "Mês atual", "km-rodados-mes");
createDataCard("TEMPO SOLICITAÇÃO → ENTREGA", "Média do mês", "tempo-medio-dias");
createDataCard("MEDIÇÕES CRIADAS", "Mês atual", "medicoes-diferentes-mes");

// Auto-refresh a cada 5 minutos
setInterval(refreshData, 5 * 60 * 1000);
