import { useEffect, useState } from "react";
import { CheckCircle2, Send, FileText, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function FichaPdfCliente({ fichaId }) {
  const [pdfs, setPdfs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState(null);

  const carregar = async () => {
    setCarregando(true);
    try {
      const res = await fetch(`${API_URL}/fichas/${fichaId}/pdfs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setPdfs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (fichaId) carregar();
  }, [fichaId]);

  const publicar = async (arquivoId, publicado) => {
    setProcessandoId(arquivoId);
    try {
      const res = await fetch(
        `${API_URL}/fichas/${fichaId}/arquivos/${arquivoId}/publicar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ publicado }),
        },
      );
      if (res.ok) carregar();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessandoId(null);
    }
  };

  if (carregando) {
    return (
      <div className="arq-vazio">
        <Loader2 className="spin" size={20} /> Carregando PDFs…
      </div>
    );
  }

  if (pdfs.length === 0) {
    return (
      <div className="arq-vazio">Nenhum PDF gerado para esta ficha ainda.</div>
    );
  }

  return (
    <div className="ficha-pdf-lista">
      {pdfs.map((pdf) => (
        <div
          key={pdf.id}
          className={`ficha-pdf-item ${pdf.publicado ? "publicado" : ""}`}
        >
          <FileText size={18} className="ficha-pdf-icone" />

          <div className="ficha-pdf-info">
            <span className="ficha-pdf-nome">{pdf.nome}</span>
            <span className="ficha-pdf-meta">
              {new Date(pdf.created_at).toLocaleString("pt-BR")} • {pdf.tipo}
              {pdf.created_by ? ` • ${pdf.created_by}` : ""}
            </span>
          </div>

          {pdf.publicado ? (
            <>
              <span className="ficha-pdf-badge">
                <CheckCircle2 size={14} /> No ar
              </span>
              <button
                className="btn-ghost btn-ghost-sm"
                onClick={() => publicar(pdf.id, false)}
                disabled={processandoId === pdf.id}
              >
                Despublicar
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => publicar(pdf.id, true)}
              disabled={processandoId === pdf.id}
            >
              {processandoId === pdf.id ? (
                <Loader2 className="spin" size={14} />
              ) : (
                <Send size={14} />
              )}
              Publicar no QR
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
