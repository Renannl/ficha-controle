import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import {
  X,
  Upload,
  FileSpreadsheet,
  Trash2,
  FileText,
  Eye,
  Download,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { PAINEL_LABELS } from "../../data/painelTemplates";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
  if (!tipo) throw new Error(`Tipo de painel inválido: "${texto}"`);
  return tipo;
}

function excelValueToISODate(valor) {
  if (!valor) return "";
  if (valor instanceof Date) return valor.toISOString().split("T")[0];
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}/.test(valor))
    return valor;
  if (typeof valor === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + valor * 86400000);
    return date.toISOString().split("T")[0];
  }
  return "";
}

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

        if (linhasMatriz.length === 0) throw new Error("Planilha vazia.");

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
          throw new Error("Cliente (linha 2) não pode estar vazio.");

        const headerIndex = linhasMatriz.findIndex((linha) =>
          linha.some(
            (cel) => String(cel).trim().toLowerCase() === "nome equipamento",
          ),
        );
        if (headerIndex === -1)
          throw new Error("Cabeçalho 'Nome Equipamento' não encontrado.");

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
          throw new Error("Nenhuma linha de equipamento.");

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

        resolve({ cliente: clienteBase, descricao: observacaoColecao, linhas });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler Excel."));
    reader.readAsArrayBuffer(file);
  });
}

const TIPOS_LABEL = {
  proposta: "Proposta Técnica",
  listaMaterial: "Lista de Material",
  docCliente: "Documentos do Cliente",
  orcamentos: "Orçamentos",
};

async function abrirArquivoAutenticado(arquivoId, nome, authFetch) {
  try {
    const res = await authFetch(`${API_URL}/arquivos/${arquivoId}/download`);
    if (!res || !res.ok) throw new Error("Falha ao baixar arquivo");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const extensao = nome.split(".").pop().toLowerCase();
    const isPdf = extensao === "pdf";
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extensao);

    if (isPdf || isImage) {
      window.open(url, "_blank");
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = nome;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (err) {
    console.error("Erro ao abrir arquivo:", err);
    alert("Erro ao abrir arquivo. Tente novamente.");
  }
}

export default function CompletarColecaoModal({
  show,
  colecaoId,
  onClose,
  onCompletado,
}) {
  const { authFetch } = useAuth();
  const [excel, setExcel] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [arquivosRascunho, setArquivosRascunho] = useState(null);
  const [carregandoArquivos, setCarregandoArquivos] = useState(false);
  const excelInputRef = useRef(null);

  useEffect(() => {
    if (show && colecaoId) {
      setCarregandoArquivos(true);
      authFetch(`${API_URL}/colecoes/${colecaoId}/rascunho`)
        .then((res) => res.json())
        .then((data) => setArquivosRascunho(data))
        .catch((err) => console.error("Erro ao buscar rascunho:", err))
        .finally(() => setCarregandoArquivos(false));
    } else {
      setArquivosRascunho(null);
    }
  }, [show, colecaoId]);

  if (!show) return null;

  async function handleCompletar() {
    if (!excel) {
      alert("A planilha Excel é obrigatória.");
      return;
    }

    const confirmacao = window.confirm(
      `Confirma completar esta coleção com o Excel "${excel.name}"?\n\n` +
        `Serão criadas as fichas e os documentos serão enviados ao SharePoint.`,
    );
    if (!confirmacao) return;

    setCarregando(true);
    try {
      const payload = await parseColecaoExcel(excel);

      const res = await authFetch(
        `${API_URL}/colecoes/${colecaoId}/completar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res || !res.ok) throw new Error("Falha ao completar coleção");

      const resultado = await res.json();
      onCompletado?.(resultado);
      onClose?.();
      alert(
        `Coleção completada! ${resultado.fichas?.length ?? 0} fichas criadas.`,
      );
    } catch (err) {
      alert(err.message || "Erro ao completar coleção.");
    } finally {
      setCarregando(false);
    }
  }

  const totalArquivos = arquivosRascunho
    ? Object.values(arquivosRascunho.arquivos || {}).flat().length
    : 0;

  return createPortal(
    <div className="importar-colecao-overlay" onClick={onClose}>
      <div
        className="importar-colecao-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="importar-colecao-header">
          <div>
            <h3>Completar Coleção</h3>
            <p>Confira os documentos e adicione o Excel:</p>
          </div>
          <button className="new-ficha-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="importar-colecao-body">
          <div className="rascunho-arquivos-section">
            <h4 className="rascunho-arquivos-title">
              <FileText size={16} />
              Documentos do rascunho ({totalArquivos})
            </h4>

            {carregandoArquivos ? (
              <p className="rascunho-loading">Carregando arquivos...</p>
            ) : !arquivosRascunho || totalArquivos === 0 ? (
              <p className="rascunho-vazio">Nenhum arquivo encontrado.</p>
            ) : (
              <div className="rascunho-arquivos-lista">
                {Object.entries(arquivosRascunho.arquivos || {}).map(
                  ([tipo, arquivos]) => {
                    if (!arquivos || arquivos.length === 0) return null;
                    return (
                      <div key={tipo} className="rascunho-tipo-grupo">
                        <div className="rascunho-tipo-label">
                          {TIPOS_LABEL[tipo] || tipo}
                        </div>
                        {arquivos.map((arq) => (
                          <button
                            key={arq.id}
                            type="button"
                            className="rascunho-arquivo-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirArquivoAutenticado(
                                arq.id,
                                arq.nome,
                                authFetch,
                              );
                            }}
                          >
                            <FileText size={14} />
                            <span className="rascunho-arquivo-nome">
                              {arq.nome}
                            </span>
                            <Eye
                              size={12}
                              className="rascunho-arquivo-view"
                              title="Visualizar"
                            />
                            <Download
                              size={12}
                              className="rascunho-arquivo-download"
                              title="Baixar"
                            />
                          </button>
                        ))}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>

          <div className="importar-divider" />

          <div className="importar-campo">
            <div className="importar-campo-label">
              Planilha Excel da coleção
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
              onChange={(e) => setExcel(e.target.files?.[0] || null)}
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
            onClick={handleCompletar}
            disabled={carregando}
          >
            {carregando ? "Processando..." : "Completar Coleção"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
