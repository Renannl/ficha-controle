import { useChecklistLog } from "../../hooks/useChecklistLog";

export default function ChecklistLogList({ fichaId }) {
  const { logs, loading } = useChecklistLog(fichaId);

  function formatarValor(campo, valor) {
    if (campo === "resultado") return valor === "ok" ? "OK" : "N/A";
    return valor === "feito" ? "concluído" : "N/A";
  }

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
      {!loading && !logs.length && (
        <p className="sessoes-empty">Nenhuma marcação registrada ainda.</p>
      )}

      <div className="sessoes-trabalho-list">
        {logs.map((log) => (
          <div key={log.id} className="sessao-trabalho-item">
            <div className="sessao-trabalho-info">
              <strong>{log.usuario || "Usuário"}</strong>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
