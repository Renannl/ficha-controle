import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  X,
  Upload,
  FileText,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { PAINEL_LABELS } from "../../data/painelTemplates";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ── Helpers (mesmos do ImportarColecaoExcel) ──
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

function excelValueToISODate(valor) {
  if (!valor) return "";
  if (valor instanceof Date) return valor.toISOString().split("T")[0];
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}/.test(valor)) return valor;
  if (typeof valor === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + valor * 86400000);
    return date.toISOString().split("T")[0];
  }
  if (typeof valor === "string") {
    const partes = valor.split("/");
    if (partes.length === 3) {
      const [dia, mes, ano] = partes;
      return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
    }
  }
  return "";
}

// ── Parse da planilha (devolve o payload do fluxo antigo) ──
function parseColecaoExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const linhasMatriz = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
        });

        if (linhasMatriz.length === 0) throw new Error("A planilha está vazia.");

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

        if (!clienteBase)
          throw new Error("A célula de Cliente (linha 2) não pode estar vazia.");

        const headerIndex = linhasMatriz.findIndex((linha) =>
          linha.some(
            (cel) => String(cel).trim().toLowerCase() === "nome equipamento",
          ),
        );
        if (headerIndex === -1)
          throw new Error(
            "Não foi possível encontrar o cabeçalho da tabela (coluna 'Nome Equipamento').",
          );

        const headers = linhasMatriz[headerIndex].map((h) => String(h).trim());
        const linhasDados = linhasMatriz.slice(headerIndex + 1);

        const linhasObjeto = linhasDados
          .filter((linha) => linha.some((cel) => String(cel).trim() !== ""))
          .map((linha) => {
            const obj = {};
            headers.forEach((h, i) => (obj[h] = linha[i] ?? ""));
            return obj;
          });

        if (linhasObjeto.length === 0)
          throw new Error("Nenhuma linha de equipamento encontrada na tabela.");

        const linhas = linhasObjeto.map((l) => ({
          nomeEquipamento: l["Nome Equipamento"] || "",
          obra: l["Obra"] || "",
          tag: l["Tag"] || "",
          dataInicio: excelValueToISODate(l["Data Início"]),
          dataTermino: excelValueToISODate(l["Data Término"]),
          tempoPrevisto: l["Tempo Previsto"] || "",
          recurso: l["Recurso"] || "",
          tipoPainel: mapearTipoPainel(l["Tipo Painel"]),
          revisao: "01",
        }));

        resolve({
          cliente: clienteBase,
          descricao: observacaoColecao,
          criado_por: undefined,
          linhas,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo Excel."));
    reader.readAsArrayBuffer(file);
  });
}

// ── Campos de documento ──
const DOCUMENTOS = [
  { id: "proposta", label: "Proposta Técnica", obrigatorio: true },
  { id: "listaMaterial", label: "Lista de Material", obrigatorio: true },
  { id: "docCliente", label: "Projetos e Documentos do Cliente", obrigatorio: false },
  { id: "orcamentos", label: "Orçamentos de Fornecedores", obrigatorio: false },
];

export default function ImportarColecaoModal({
  show,
  onClose,
  onImportado,
}) {
  const { authFetch } = useAuth();
  const [arquivos, setArquivos] = useState({});
  const [excel, setExcel] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const excelInputRef = useRef(null);
  const fileInputRefs = useRef({});

  if (!show) return null;

  function handleArquivo(id, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setArquivos((prev) => ({ ...prev, [id]: file }));
  }

  function removerArquivo(id) {
    setArquivos((prev) => {
      const novo = { ...prev };
      delete novo[id];
      return novo;
    });
    if (fileInputRefs.current[id]) fileInputRefs.current[id].value = "";
  }

  function handleExcel(e) {
    const file = e.target.files?.[0];
    if (file) setExcel(file);
  }

  async function handleImportar() {
    const faltando = DOCUMENTOS.filter((d) => d.obrigatorio && !arquivos[d.id]);
    if (faltando.length) {
      alert(
        `Arquivos obrigatórios faltando:\n• ${faltando
          .map((f) => f.label)
          .join("\n• ")}`,
      );
      return;
    }
    if (!excel) {
      alert("A planilha Excel é obrigatória para criar a coleção.");
      return;
    }

    setCarregando(true);
    try {
      const payload = await parseColecaoExcel(excel);

      const form = new FormData();
      form.append("payload", JSON.stringify(payload));
      DOCUMENTOS.forEach((d) => {
        if (arquivos[d.id]) form.append(d.id, arquivos[d.id]);
      });

      // ⚠️ NÃO setar Content-Type manualmente — o navegador monta o multipart
      const res = await authFetch(`${API_URL}/colecoes/importar`, {
        method: "POST",
        body: form,
      });

      if (!res || !res.ok) {
        const texto = res ? await res.text() : "Sem resposta";
        throw new Error(texto || "Falha ao importar coleção");
      }

      const resultado = await res.json();
      onImportado?.(resultado);
      onClose?.();
      alert(
        `Coleção importada com sucesso! ${resultado.fichas?.length ?? 0} fichas criadas.`,
      );
    } catch (err) {
      console.error("[Importar Coleção]", err);
      alert(
        err.message || "Erro ao importar. Verifique o arquivo e tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="importar-colecao-overlay" onClick={onClose}>
      <div
        className="importar-colecao-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="importar-colecao-header">
          <div>
            <h3>Importar Coleção</h3>
            <p>Adicione os arquivos necessários:</p>
          </div>
          <button className="new-ficha-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="importar-colecao-body">
          {DOCUMENTOS.map((doc) => {
            const file = arquivos[doc.id];
            return (
              <div key={doc.id} className="importar-campo">
                <div className="importar-campo-label">
                  {doc.label}
                  {doc.obrigatorio && (
                    <span className="importar-obrigatorio">*</span>
                  )}
                </div>
                {file ? (
                  <div className="importar-campo-arquivo">
                    <FileText size={16} />
                    <span className="importar-campo-nome">{file.name}</span>
                    <button
                      type="button"
                      className="importar-campo-remover"
                      onClick={() => removerArquivo(doc.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="importar-campo-selecionar"
                    onClick={() => fileInputRefs.current[doc.id]?.click()}
                  >
                    <Upload size={16} />
                    Escolher arquivo
                  </button>
                )}
                <input
                  ref={(el) => (fileInputRefs.current[doc.id] = el)}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.zip,.dwg"
                  onChange={(e) => handleArquivo(doc.id, e)}
                  style={{ display: "none" }}
                />
              </div>
            );
          })}

          <div className="importar-divider" />

          <div className="importar-campo">
            <div className="importar-campo-label">
              Planilha de criação da coleção
              <span className="importar-obrigatorio">*</span>
            </div>
            {excel ? (
              <div className="importar-campo-arquivo">
                <FileSpreadsheet size={16} />
                <span className="importar-campo-nome">{excel.name}</span>
                <button
                  type="button"
                  className="importar-campo-remover"
                  onClick={() => setExcel(null)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="importar-campo-selecionar"
                onClick={() => excelInputRef.current?.click()}
              >
                <Upload size={16} />
                Escolher planilha (.xlsx)
              </button>
            )}
            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcel}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <div className="importar-colecao-footer">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={carregando}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleImportar}
            disabled={carregando}
          >
            {carregando ? "Importando..." : "Importar"}
          </button>
        </div>
      </div>
    </div>
  );
}
