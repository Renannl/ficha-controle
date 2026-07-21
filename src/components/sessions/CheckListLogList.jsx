import { useMemo } from "react";
import { useChecklistLog } from "../../hooks/useChecklistLog";
import { useSessoesTrabalho } from "../../hooks/useSessoesTrabalho";
import {
  calcularTemposDasMarcacoes,
  formatarTempo,
  formatarNomeUsuario,
} from "../../utils/tempoUtils";

export default function ChecklistLogList({ fichaId }) {
  const { logs, loading } = useChecklistLog(fichaId);
  const { sessoes } = useSessoesTrabalho(fichaId);

  function formatarValor(campo, valor) {
    if (campo === "resultado") return valor === "ok" ? "OK" : "N/A";
    return valor === "feito" ? "concluído" : "N/A";
  }

  const logsComTempo = useMemo(() => {
    if (!logs.length) return [];
    if (!sessoes.length) return logs.map((l) => ({ ...l, duracao: null }));
    return calcularTemposDasMarcacoes(logs, sessoes, "timestamp");
  }, [logs, sessoes]);

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
              </span>
              <span className="sessao-duracao">
                {new Date(log.timestamp).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              {log.duracao !== null && (
                <span className="sessao-duracao sessao-duracao-tempo">
                  ⏱ +{formatarTempo(log.duracao)} (total:{" "}
                  {formatarTempo(log.tempoAcumulado)})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
