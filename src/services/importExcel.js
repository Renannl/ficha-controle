import * as XLSX from "xlsx";

// Mapeia o valor da planilha para o enum aceito no select "Tipo de Painel"
const TIPO_PAINEL_MAP = {
  "quadro sobrepor ou embutir": "sobrepor_embutir",
  "quadro autoportante": "autoportante",
  "pmt": "pmt",
};

function normalizarTipoPainel(valor) {
  const key = String(valor || "").trim().toLowerCase();
  return TIPO_PAINEL_MAP[key] || null;
}

export async function importarExcelParaFichas(file, clienteSelecionado) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  return rows.map((row) => ({
    nomeEquipamento: row["nome_equipamento"],
    cliente: clienteSelecionado,
    quantidade: Number(row["quantidade"]) || 1,
    obra: row["obra"],
    tag: row["tag"] || "",
    dataInicio: row["data_inicio"] || null,
    dataTermino: row["data_termino"] || null,
    tempoPrevisto: row["tempo_previsto"] || "",
    recurso: row["recurso"] || "",
    tipoPainel: normalizarTipoPainel(row["tipo_painel"]),
  }));
}
