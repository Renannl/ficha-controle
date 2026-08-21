import { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronRight, ClipboardList, Clock3 } from "lucide-react";
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
  const [gruposAbertos, setGruposAbertos] = useState({});

  function formatarValor(campo, valor) {
    if (campo === "resultado" || campo === "verificacao") {
      const v = String(valor || "").toLowerCase();
      if (v === "ok") return "OK";
      if (v === "na") return "N/A";
      if (v === "erro") return "ERRO";
      return valor || "N/A";
    }
    return valor === "feito" ? "concluído" : valor || "N/A";
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

    return base.map((log) => ({
      ...log,
      etapa: log.etapa || mapaEtapas[log.itemId] || null,
    }));
  }, [logs, sessoes, mapaEtapas]);

  const logsExibicao = useMemo(
    () =>
      [...logsComTempo].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      ),
    [logsComTempo],
  );

  const grupos = useMemo(() => {
    const map = {};
    logsExibicao.forEach((log) => {
      const chave = log.etapa || "_sem_etapa";
      if (!map[chave]) {
        map[chave] = { etapa: chave, logs: [], totalDuracao: 0 };
      }
      map[chave].logs.push(log);
      if (log.duracao != null) map[chave].totalDuracao += log.duracao;
    });

    return Object.values(map).sort((a, b) => {
      const dataA = new Date(a.logs[0]?.timestamp || 0);
      const dataB = new Date(b.logs[0]?.timestamp || 0);
      return dataB - dataA;
    });
  }, [logsExibicao]);

  useEffect(() => {
    if (!grupos.length) return;
    setGruposAbertos((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      return { [grupos[0].etapa]: true };
    });
  }, [grupos]);

  function toggleGrupo(etapa) {
    setGruposAbertos((prev) => ({ ...prev, [etapa]: !prev[etapa] }));
  }

  return (
    <div className="card mb-3">
      <div className="section-header">
        <div className="section-icon">
          <ClipboardList size={18} />
        </div>
        <div>
          <h2>Histórico de Marcações</h2>
          <p>Cada item marcado no checklist, com data/hora e responsável</p>
        </div>
      </div>

      {loading && <p className="sessoes-empty">Carregando...</p>}
      {!loading && !logsExibicao.length && (
        <p className="sessoes-empty">Nenhuma marcação registrada ainda.</p>
      )}

      <div className="sessoes-grupos-list">
        {grupos.map((grupo) => {
          const aberto = !!gruposAbertos[grupo.etapa];
          const label =
            grupo.etapa === "_sem_etapa"
              ? "Sem etapa definida"
              : ETAPA_LABELS[grupo.etapa] || grupo.etapa;

          return (
            <div key={grupo.etapa} className="sessao-grupo">
              <button
                className="sessao-grupo-header"
                onClick={() => toggleGrupo(grupo.etapa)}
              >
                <div className="sessao-grupo-header-left">
                  {aberto ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                  <strong>{label}</strong>
                </div>

                <div className="sessao-grupo-header-right">
                  <span className="sessao-grupo-count">
                    {grupo.logs.length}{" "}
                    {grupo.logs.length === 1 ? "marcação" : "marcações"}
                  </span>
                  {grupo.totalDuracao > 0 && (
                    <span className="sessao-grupo-total">
                      {formatarTempo(grupo.totalDuracao)}
                    </span>
                  )}
                </div>
              </button>

              {aberto && (
                <div className="sessoes-trabalho-list sessoes-trabalho-list--scroll">
                  {grupo.logs.map((log) => (
                    <div key={log.id} className="sessao-trabalho-item">
                      <div className="sessao-trabalho-info">
                        <strong>
                          {formatarNomeUsuario(log.usuario) || "Usuário"}
                        </strong>
                        <span>
                          {" "}
                          marcou <strong>{log.descricao}</strong>
                          {log.campo === "sessionMark" &&
                            ` (sessão ${log.sessaoIndex + 1})`}{" "}
                          como{" "}
                          <strong>{formatarValor(log.campo, log.valor)}</strong>
                        </span>
                        {log.duracao !== null && (
                          <span className="sessao-duracao sessao-duracao-tempo">
                            <Clock3
                              size={13}
                              style={{ verticalAlign: "-2px" }}
                            />{" "}
                            +{formatarTempo(log.duracao)} (total:{" "}
                            {formatarTempo(log.tempoAcumulado)})
                          </span>
                        )}
                      </div>

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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
