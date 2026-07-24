import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { TIPOS_PAINEL, PAINEL_LABELS } from "../../data/painelTemplates";
import { useAuth } from "../../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Mapeia o texto do Excel pro valor interno do sistema
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
  const tipo = LABEL_PARA_TIPO[chave];

  if (!tipo) {
    throw new Error(
      `Tipo de painel inválido na planilha: "${texto}". Valores aceitos: ${Object.values(
        PAINEL_LABELS,
      ).join(", ")}`,
    );
  }

  return tipo;
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

export function ImportarColecaoExcel({ onImportado, children }) {
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

        const linhasMatriz = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
        });

        if (linhasMatriz.length === 0) {
          alert("A planilha está vazia.");
          return;
        }

        // Linha 1 (índice 0): cabeçalhos "Cliente" / "Observação"
        // Linha 2 (índice 1): valores correspondentes
        const headerColecao = linhasMatriz[0] || [];
        const valoresColecao = linhasMatriz[1] || [];

        const idxCliente = headerColecao.findIndex(
          (h) => String(h).trim().toLowerCase() === "cliente",
        );
        const idxObservacao = headerColecao.findIndex(
          (h) => String(h).trim().toLowerCase() === "observação",
        );

        const clienteBase =
          idxCliente !== -1
            ? String(valoresColecao[idxCliente] || "").trim()
            : "";
        const observacaoColecao =
          idxObservacao !== -1
            ? String(valoresColecao[idxObservacao] || "").trim()
            : "";

        if (!clienteBase) {
          alert("A célula de Cliente (linha 2) não pode estar vazia.");
          return;
        }

        // Encontra a linha de cabeçalho da tabela de equipamentos
        const headerIndex = linhasMatriz.findIndex((linha) =>
          linha.some(
            (cel) => String(cel).trim().toLowerCase() === "nome equipamento",
          ),
        );

        if (headerIndex === -1) {
          alert(
            "Não foi possível encontrar o cabeçalho da tabela (coluna 'Nome Equipamento').",
          );
          return;
        }

        const headers = linhasMatriz[headerIndex].map((h) => String(h).trim());
        const linhasDados = linhasMatriz.slice(headerIndex + 1);

        const linhasObjeto = linhasDados
          .filter((linha) => linha.some((cel) => String(cel).trim() !== ""))
          .map((linha) => {
            const obj = {};
            headers.forEach((h, i) => {
              obj[h] = linha[i] ?? "";
            });
            return obj;
          });

        if (linhasObjeto.length === 0) {
          alert("Nenhuma linha de equipamento encontrada na tabela.");
          return;
        }

        const linhas = linhasObjeto.map((l) => ({
          nomeEquipamento: l["Nome Equipamento"] || "",
          obra: l["Obra"] || "",
          tag: l["Tag"] || "",
          dataInicio: excelValueToISODate(l["Data Início"]),
          dataTermino: excelValueToISODate(l["Data Término"]),
          tempoPrevisto: l["Tempo Previsto"] || "",
          recurso: l["Recurso"] || "",
          tipoPainel: mapearTipoPainel(l["Tipo Painel"]),
        }));

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
        alert(
          err.message ||
            "Erro ao importar. Verifique o arquivo e tente novamente.",
        );
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
      {children ? (
        children({ onClick: () => inputRef.current?.click(), carregando })
      ) : (
        <button onClick={() => inputRef.current?.click()} disabled={carregando}>
          {carregando ? "Importando..." : "📥 Importar Coleção (Excel)"}
        </button>
      )}
    </>
  );
}
