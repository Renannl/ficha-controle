import { useEffect, useState } from "react";
import { authFetch } from "../../services/apiClient";

function formatarData(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TimelineFicha({ fichaId }) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!fichaId) return;
    let ativo = true;
    (async () => {
      setLoading(true);
      setErro(null);
      try {
        const res = await authFetch(`/fichas/${fichaId}/timeline`);
        if (!res?.ok) throw new Error("Erro ao carregar histórico");
        const data = await res.json();
        if (ativo) setEventos(data.eventos || []);
      } catch (e) {
        if (ativo) setErro(e.message);
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [fichaId]);

  if (loading) return <p className="timeline-vazio">Carregando histórico…</p>;
  if (erro) return <p className="timeline-erro">{erro}</p>;
  if (!eventos.length)
    return <p className="timeline-vazio">Nenhum evento registrado ainda.</p>;

  return (
    <div className="timeline">
      {eventos.map((ev) => (
        <div key={ev.id} className="timeline-item">
          <div className="timeline-dot" />
          <div className="timeline-conteudo">
            <div className="timeline-descricao">{ev.descricao}</div>
            <div className="timeline-meta">
              <span className="timeline-usuario">{ev.usuarioNome}</span>
              <span className="timeline-data">{formatarData(ev.createdAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
