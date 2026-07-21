import { useState } from "react";
import { Pencil } from "lucide-react";
import { useSessoesTrabalho } from "../../hooks/useSessoesTrabalho";
import EditarSessaoModal from "./EditarSessaoModal";

function formatarData(iso) {
  if (!iso) return "em andamento";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatarDuracao(segundos) {
  const s = Math.floor(Number(segundos) || 0);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}h${m}min${sec}s`;
}

export default function SessoesTrabalhoList({ fichaId, user }) {
  const {
    sessoes,
    totalSegundos,
    tempoDecorridoSegundos,
    loading,
    updateSessao,
  } = useSessoesTrabalho(fichaId);
  const [sessaoEditando, setSessaoEditando] = useState(null);

  const isAdmin = user?.role === "admin";

  return (
    <div className="sessions-panel">
      <div className="card mb-3">
        <div className="section-header">
          <div className="section-icon">🕐</div>

          <div>
            <h2>Sessões de Trabalho</h2>
            <p>Histórico automático de início e fim de cada sessão</p>
          </div>
        </div>

        <div className="checklist-summary mb-3">
          <div>
            <span className="summary-text">Tempo real da ficha:</span>{" "}
            <span
              className="summary-text"
              style={{ color: "var(--blue-accent)", fontSize: 14 }}
              title="Tempo total decorrido, sem duplicar quando há trabalho simultâneo"
            >
              {formatarDuracao(tempoDecorridoSegundos)}
            </span>
          </div>

          <div>
            <span className="summary-text">Homem-hora (esforço total):</span>{" "}
            <span
              className="summary-text"
              style={{ color: "var(--green-accent, #2e9e5b)", fontSize: 14 }}
              title="Soma do tempo de todos os colaboradores (duplica quando há trabalho simultâneo)"
            >
              {formatarDuracao(totalSegundos)}
            </span>
          </div>
        </div>

        {loading && <p className="sessoes-empty">Carregando sessões...</p>}

        {!loading && !sessoes.length && (
          <p className="sessoes-empty">Nenhuma sessão registrada ainda.</p>
        )}

        <div className="sessoes-trabalho-list">
          {sessoes.map((s) => (
            <div key={s.id} className="sessao-trabalho-item">
              <div className="sessao-trabalho-info">
                <strong>{s.usuario}</strong>
                <span>
                  {formatarData(s.inicio)} → {formatarData(s.fim)}
                </span>
                <span className="sessao-duracao">
                  {formatarDuracao(s.duracao_segundos)}
                </span>
                {s.origem === "manual" && (
                  <span
                    className="sessao-tag-manual"
                    title={`Editado por ${s.editado_manualmente_por}`}
                  >
                    editado manualmente
                  </span>
                )}
              </div>

              {isAdmin && (
                <button
                  className="btn-icon-edit"
                  title="Editar horário"
                  onClick={() => setSessaoEditando(s)}
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <EditarSessaoModal
        sessao={sessaoEditando}
        onClose={() => setSessaoEditando(null)}
        onSave={updateSessao}
      />
    </div>
  );
}
