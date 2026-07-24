import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { TIPOS_PAINEL, PAINEL_LABELS } from "../data/painelTemplates";
import { useAuth } from "./useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Mapeia o texto do Excel pro valor interno do sistema
const LABEL_PARA_TIPO = Object.fromEntries(
  Object.entries(PAINEL_LABELS).map(([valor, label]) => [
    label.trim().toLowerCase(),
    valor,
  ]),
);

function mapearTipoPainel(texto) {
  if (!texto) return "";
  const chave = String(texto).trim().toLowerCase();
  return LABEL_PARA_TIPO[chave] || TIPOS_PAINEL.SOBREPOR_EMBUTIR; // fallback
}

// helper no topo do arquivo
function excelValueToISODate(valor) {
  if (!valor) return "";

  // já é um objeto Date (graças ao cellDates: true)
  if (valor instanceof Date) {
    return valor.toISOString().split("T")[0]; // yyyy-MM-dd
  }

  // string já no formato certo
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}/.test(valor)) {
    return valor;
  }

  // número serial do Excel (fallback, caso cellDates não pegue)
  if (typeof valor === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + valor * 86400000);
    return date.toISOString().split("T")[0];
  }

  // string em outro formato, tenta parsear (ex: "01/12/2026")
  if (typeof valor === "string") {
    const partes = valor.split("/");
    if (partes.length === 3) {
      const [dia, mes, ano] = partes;
      return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
    }
  }

  return "";
}

export function ImportarColecaoExcel({ onImportado }) {
  const { authFetch } = useAuth();
  const inputRef = useRef(null);
  const [carregando, setCarregando] = useState(false);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setCarregando(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const linhasBrutas = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (linhasBrutas.length === 0) {
          alert("A planilha está vazia.");
          return;
        }

        const linhas = linhasBrutas.map((l) => ({
          nomeEquipamento: l["Nome Equipamento"] || l["nomeEquipamento"] || "",
          obra: l["Obra"] || "",
          cliente: String(l["Cliente"] || "").trim(),
          tag: l["Tag"] || "",
          dataInicio: excelValueToISODate(l["Data Início"] || l["dataInicio"]), // ✅
          dataTermino: excelValueToISODate(
            l["Data Término"] || l["dataTermino"],
          ), // ✅
          tempoPrevisto: l["Tempo Previsto"] || l["tempoPrevisto"] || "",
          recurso: l["Recurso"] || "",
          tipoPainel: mapearTipoPainel(l["Tipo Painel"] || l["tipoPainel"]),
          observacao: String(l["Observação"] || l["observacao"] || "").trim(),
        }));

        const clienteBase = linhas[0].cliente;
        const clienteDivergente = linhas.some((l) => l.cliente !== clienteBase);

        if (!clienteBase) {
          alert("A coluna 'Cliente' não pode estar vazia.");
          return;
        }

        if (clienteDivergente) {
          alert(
            "Todas as linhas devem ter o mesmo Cliente para importar em uma única coleção.",
          );
          return;
        }

        const observacaoColecao =
          linhas.find((l) => l.observacao)?.observacao || "";

        const payload = {
          cliente: clienteBase,
          descricao: observacaoColecao,
          criado_por: undefined,
          linhas,
        };

        const res = await authFetch(`${API_URL}/colecoes/importar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res || !res.ok) throw new Error("Falha ao importar coleção");

        const resultado = await res.json();
        onImportado?.(resultado);
        alert(
          `Coleção importada com sucesso! ${resultado.fichas.length} fichas criadas.`,
        );
      } catch (err) {
        console.error("[Importar Excel]", err);
        alert("Erro ao importar. Verifique o arquivo e tente novamente.");
      } finally {
        setCarregando(false);
        e.target.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button onClick={() => inputRef.current?.click()} disabled={carregando}>
        {carregando ? "Importando..." : "📥 Importar Coleção (Excel)"}
      </button>
    </>
  );
}
