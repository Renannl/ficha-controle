const XLSX = require("xlsx");

const cabecalho = [
  "Nome Equipamento",
  "Obra",
  "Cliente",
  "Tag",
  "Data Início",
  "Data Término",
  "Tempo Previsto",
  "Recurso",
  "Tipo Painel",
  "Observação",
];

const exemplo = [
  "QGBT-01",
  "Obra Vitória Shopping",
  "Ambev",
  "TAG-001",
  "01/08/2026",
  "15/08/2026",
  "40h",
  "João Silva",
  "Quadro sobrepor ou embutir",
  "Painel para subestação principal",
];

const worksheet = XLSX.utils.aoa_to_sheet([cabecalho, exemplo]);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Coleção");

XLSX.writeFile(workbook, "template-colecao.xlsx");
console.log("✅ template-colecao.xlsx gerado com sucesso!");
