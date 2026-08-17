import { useState, useEffect } from "react";
import { authFetch } from "../../services/apiClient";
import { getEtapaLabel, podeTrabalharNaEtapa } from "../../utils/etapas";

function formatarTempo(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.floor(segundos % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function BotaoSessaoTrabalho({
  fichaId,
  user,
  sessoes,
  onChange,
  etapa,
}) {
  const [tempoAtual, setTempoAtual] = useState(0);
  const [loading, setLoading] = useState(false);

  const sessaoAtiva =
    sessoes?.find((s) => !s.fim && s.usuario === user?.username) || null;

  useEffect(() => {
    if (!sessaoAtiva) {
      setTempoAtual(0);
      return;
    }
    const inicio = new Date(sessaoAtiva.inicio).getTime();
    const atualizar = () => setTempoAtual((Date.now() - inicio) / 1000);
    atualizar();
    const interval = setInterval(atualizar, 1000);
    return () => clearInterval(interval);
  }, [sessaoAtiva]);

  const podeIniciar = podeTrabalharNaEtapa(user, etapa);
  const bloqueado = !podeIniciar && !sessaoAtiva;

  const handlePlay = async () => {
    if (bloqueado) return;
    try {
      setLoading(true);
      const res = await authFetch(`/fichas/${fichaId}/sessao/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etapa }), // 🆕 envia a etapa
      });
      if (!res) return;
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao iniciar sessão.");
        return;
      }
      await onChange?.();
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`/fichas/${fichaId}/sessao/pausar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessaoId: sessaoAtiva?.id }),
      });
      if (!res) return;
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao pausar sessão.");
        return;
      }
      await onChange?.(); // 🔑 recarrega a fonte única de verdade
    } finally {
      setLoading(false);
    }
  };

  const rodando = !!sessaoAtiva;

  return (
    <div className="sessao-trabalho-float">
      {!rodando && etapa && (
        <div
          style={{
            fontSize: 12,
            color: bloqueado ? "var(--red, #e74c3c)" : "var(--text-secondary)",
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          Etapa atual: {getEtapaLabel(etapa)}
          {bloqueado && " — seu cargo não permite"}
        </div>
      )}

      <button
        onClick={rodando ? handlePause : handlePlay}
        disabled={loading || bloqueado}
        className={`sessao-trabalho-btn ${rodando ? "pausar" : "iniciar"}`}
        title={bloqueado ? "Seu cargo não permite iniciar nesta etapa" : ""}
      >
        {rodando ? "⏸" : "▶"}
      </button>

      {rodando && (
        <div className="sessao-trabalho-tempo-float">
          {formatarTempo(tempoAtual)}
        </div>
      )}
    </div>
  );
}
