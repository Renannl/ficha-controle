import { useRef, useState } from "react";
import { X, Upload, FileText, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const DOCUMENTOS = [
  { id: "proposta", label: "Proposta Técnica", obrigatorio: true },
  { id: "listaMaterial", label: "Lista de Material", obrigatorio: true },
  { id: "docCliente", label: "Projetos e Documentos do Cliente", obrigatorio: true },
  { id: "orcamentos", label: "Orçamentos de Fornecedores", obrigatorio: true },
];

export default function ImportarColecaoModal({ show, onClose, onImportado }) {
  const { authFetch } = useAuth();
  const [arquivos, setArquivos] = useState({});
  const [carregando, setCarregando] = useState(false);
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

  async function handleSalvarRascunho() {
    const faltando = DOCUMENTOS.filter((d) => d.obrigatorio && !arquivos[d.id]);
    if (faltando.length) {
      alert(`Arquivos obrigatórios faltando:\n• ${faltando.map((f) => f.label).join("\n• ")}`);
      return;
    }

    setCarregando(true);
    try {
      const form = new FormData();
      DOCUMENTOS.forEach((d) => {
        if (arquivos[d.id]) form.append(d.id, arquivos[d.id]);
      });

      const res = await authFetch(`${API_URL}/colecoes/importar-documentos`, {
        method: "POST",
        body: form,
      });

      if (!res || !res.ok) throw new Error("Falha ao salvar rascunho");

      const resultado = await res.json();
      onImportado?.(resultado);
      onClose?.();
      alert("Rascunho salvo! O admin agora pode adicionar o Excel.");
    } catch (err) {
      alert(err.message || "Erro ao salvar rascunho.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="importar-colecao-overlay" onClick={onClose}>
      <div className="importar-colecao-modal" onClick={(e) => e.stopPropagation()}>
        <div className="importar-colecao-header">
          <div>
            <h3>Salvar Rascunho</h3>
            <p>Adicione os documentos da coleção:</p>
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
                  {doc.obrigatorio && <span className="importar-obrigatorio">*</span>}
                </div>
                {file ? (
                  <div className="importar-campo-arquivo">
                    <FileText size={16} />
                    <span className="importar-campo-nome">{file.name}</span>
                    <button type="button" className="importar-campo-remover" onClick={() => removerArquivo(doc.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <button type="button" className="importar-campo-selecionar" onClick={() => fileInputRefs.current[doc.id]?.click()}>
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
        </div>

        <div className="importar-colecao-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={carregando}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSalvarRascunho} disabled={carregando}>
            {carregando ? "Salvando..." : "Salvar Rascunho"}
          </button>
        </div>
      </div>
    </div>
  );
}
