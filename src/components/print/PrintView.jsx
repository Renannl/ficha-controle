import { useState, useEffect } from "react";
import { OPERACOES } from "../../data/fichaTemplate";
import { authFetch } from "../../services/apiClient";
import { useSessoesTrabalho } from "../../hooks/useSessoesTrabalho";

import PrintViewOperacao from "./PrintViewOperacao";
import PrintViewTAF from "./PrintViewTAF";
import PrintViewFotos from "./PrintViewFotos";
import PrintViewFotosTecnicas from "./PrintViewFotosTecnicas";

function getOperacao(operacoes, id) {
  if (!operacoes) return undefined;
  if (Array.isArray(operacoes)) {
    return operacoes.find((o) => o.id === id);
  }
  if (operacoes instanceof Map) {
    return operacoes.get(id);
  }
  return operacoes[id];
}

export default function PrintView({ ficha, isBook = false }) {
  // 🆕 Resolve o ID correto (dbId preferencial, fallback pra id)
  const fichaId = ficha?.dbId ?? ficha?.id;

  const { sessoes } = useSessoesTrabalho(fichaId);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!fichaId) return;
    let cancelado = false;

    (async () => {
      try {
        const response = await authFetch(`/fichas/${fichaId}/checklist-log`);
        if (!response || !response.ok) return;
        const data = await response.json();
        if (!cancelado) setLogs(Array.isArray(data) ? data : data.logs || []);
      } catch (err) {
        console.error("[PrintView] Erro ao buscar logs:", err);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [fichaId]);

  const op = getOperacao(OPERACOES, ficha.operacao);

  switch (ficha.operacao) {
    case "80":
      return ficha.tipoFotografico === "tecnica" ? (
        <PrintViewFotosTecnicas ficha={ficha} isBook={isBook} />
      ) : (
        <PrintViewFotos ficha={ficha} isBook={isBook} />
      );
    case "50":
      return <PrintViewTAF ficha={ficha} op={op} isBook={isBook} />;
    case "90":
    case "10":
    default:
      return (
        <PrintViewOperacao
          ficha={ficha}
          op={op}
          isBook={isBook}
          sessoes={sessoes}
          logs={logs}
        />
      );
  }
}
