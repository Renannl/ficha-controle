import { useMemo } from "react";
import { useChecklistLog } from "../../hooks/useChecklistLog";
import { useSessoesTrabalho } from "../../hooks/useSessoesTrabalho";
import {
  calcularTemposDasMarcacoes,
  formatarTempo,
  formatarNomeUsuario,
} from "../../utils/tempoUtils";
import { getMapaEtapasPorItem, ETAPA_LABELS } from "../../utils/etapaUtils";

export default function ChecklistLogList({ fichaId, tipoPainel }) {
  const { logs, loading } = useChecklistLog(fichaId);
  const { sessoes } = useSessoesTrabalho(fichaId);

  function formatarValor(campo, valor) {
    if (campo === "resultado") return valor === "ok" ? "OK" : "N/A";
    return valor === "feito" ? "concluído" : "N/A";
  }

  const mapaEtapas = useMemo(
    () => (tipoPainel ? getMapaEtapasPorItem(tipoPainel) : {}),
    [tipoPainel],
  );

  const logsComTempo = useMemo(() => {
    if (!logs.length) return [];
    const base = !sessoes.length
      ? logs.map((l) => ({ ...l, duracao: null }))
      : calcularTemposDasMarcacoes(logs, sessoes, "timestamp");

    // adiciona a etapa em cada log com base no itemId
    return base.map((log) => ({
      ...log,
      etapa: mapaEtapas[log.itemId] || null,
    }));
  }, [logs, sessoes, mapaEtapas]);

  // 🔹 Resumo por etapa
  const resumoPorEtapa = useMemo(() => {
    const resumo = {};
    logsComTempo.forEach((log) => {
      if (!log.etapa || log.duracao == null) return;
      if (!resumo[log.etapa]) resumo[log.etapa] = 0;
      resumo[log.etapa] += log.duracao;
    });
    return resumo;
  }, [logsComTempo]);

  const logsExibicao = useMemo(
    () =>
      [...logsComTempo].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      ),
    [logsComTempo],
  );

  return (
    <div className="card mb-3">
      <div className="section-header">
        <div className="section-icon">📋</div>
        <div>
          <h2>Histórico de Marcações</h2>
          <p>Cada item marcado no checklist, com data/hora e responsável</p>
        </div>
      </div>

      {/* 🔹 Resumo de tempo por etapa */}
      {Object.keys(resumoPorEtapa).length > 0 && (
        <div className="resumo-etapas">
          {Object.entries(resumoPorEtapa).map(([etapa, total]) => (
            <div key={etapa} className="resumo-etapa-item">
              <strong>{ETAPA_LABELS[etapa] || etapa}:</strong>{" "}
              {formatarTempo(total)}
            </div>
          ))}
        </div>
      )}

      {loading && <p className="sessoes-empty">Carregando...</p>}
      {!loading && !logsExibicao.length && (
        <p className="sessoes-empty">Nenhuma marcação registrada ainda.</p>
      )}

      <div className="sessoes-trabalho-list">
        {logsExibicao.map((log) => (
          <div key={log.id} className="sessao-trabalho-item">
            <div className="sessao-trabalho-info">
              <strong>{formatarNomeUsuario(log.usuario) || "Usuário"}</strong>
              <span>
                {" "}
                marcou <strong>{log.descricao}</strong>
                {log.campo === "sessionMark" &&
                  ` (sessão ${log.sessaoIndex + 1})`}{" "}
                como <strong>{formatarValor(log.campo, log.valor)}</strong>
                {log.etapa && (
                  <span className="etapa-badge">
                    {" "}
                    · {ETAPA_LABELS[log.etapa]}
                  </span>
                )}
              </span>
              {log.duracao !== null && (
                <span className="sessao-duracao sessao-duracao-tempo">
                  ⏱ +{formatarTempo(log.duracao)} (total:{" "}
                  {formatarTempo(log.tempoAcumulado)})
                </span>
              )}
            </div>

            {/* 🔹 timestamp escondido no canto inferior direito */}
            <span className="sessao-timestamp-corner">
              {new Date(log.timestamp).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
