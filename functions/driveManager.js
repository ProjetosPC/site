// functions/driveManager.js
export default {
  /**
   * Busca toda a aba sheetName da planilha spreadsheetId via Google Visualization API
   * e retorna um array de linhas (cada linha é um array de valores), incluindo a primeira
   * linha de cabeçalhos.
   */
  async getSheet(spreadsheetId, sheetName) {
    // Monta a URL para exportar o sheet como JSON via gviz
    const url = `https://docs.google.com/spreadsheets/d/${
      spreadsheetId
    }/gviz/tq?sheet=${encodeURIComponent(sheetName)}&tqx=out:json`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Erro ${res.status} ao buscar aba "${sheetName}" da planilha ${spreadsheetId}`
      );
    }

    const text = await res.text();
    // Extrai o JSON que vem dentro de google.visualization.Query.setResponse(...)
    const match = text.match(
      /google\.visualization\.Query\.setResponse\(([\s\S]+)\);/
    );
    if (!match || match.length < 2) {
      throw new Error(
        `Resposta inesperada ao buscar aba "${sheetName}": não foi possível extrair JSON`
      );
    }

    const json = JSON.parse(match[1]);
    const table = json.table;

    // Cabeçalhos (labels das colunas)
    const headers = table.cols.map((col) => col.label || "");

    // Linhas de dados
    const rows = table.rows.map((row) =>
      row.c.map((cell) => {
        // Se a célula for null ou sem valor, retorna string vazia
        if (!cell || cell.v === null || cell.v === undefined) return "";
        return cell.v;
      })
    );

    // Retorna um array com a primeira linha de headers e depois os dados
    return [headers, ...rows];
  },
};
