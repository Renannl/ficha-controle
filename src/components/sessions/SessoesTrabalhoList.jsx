// src/components/sessions/SessoesTrabalhoList.jsx
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
  });
}

function formatarDuracao(segundos) {
  const s = Math.floor(Number(segundos) || 0);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  return `${h}h${m}min`;
}

export default function SessoesTrabalhoList({ fichaId, user }) {
  const { sessoes, totalSegundos, loading, updateSessao } =
    useSessoesTrabalho(fichaId);
  const [sessaoEditando, setSessaoEditando] = useState(null);

  const isAdmin = user?.role === "admin";

  if (loading) return <p>Carregando sessões...</p>;

  return (
    <div className="sessoes-trabalho-container">
      <div className="sessoes-trabalho-header">
        <h4>Sessões de Trabalho</h4>
        <span className="sessoes-total">
          Total: {formatarDuracao(totalSegundos)}
        </span>
      </div>

      {!sessoes.length && <p>Nenhuma sessão registrada ainda.</p>}

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
                <span className="sessao-tag-manual" title={`Editado por ${s.editado_manualmente_por}`}>
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

      <EditarSessaoModal
        sessao={sessaoEditando}
        onClose={() => setSessaoEditando(null)}
        onSave={updateSessao}
      />
    </div>
  );
}
