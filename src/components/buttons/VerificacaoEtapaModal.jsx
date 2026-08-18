import { useEffect, useState } from "react";
import { X, Check, Minus } from "lucide-react";
import { getEtapaLabel } from "../../utils/etapas";

export default function VerificacaoEtapaModal({
  isOpen = false,
  etapa = null,
  itens = [],
  resultadosIniciais = [],
  onConfirm,
  onCancel,
}) {
  const [resultados, setResultados] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    const inicial = {};
    (resultadosIniciais || []).forEach((valor, idx) => {
      if (valor) inicial[idx] = valor;
    });
    setResultados(inicial);
  }, [isOpen, resultadosIniciais]);

  if (!isOpen) return null;

  function toggle(idx, valor) {
    setResultados((prev) => {
      const novo = { ...prev };
      if (prev[idx] === valor) delete novo[idx];
      else novo[idx] = valor;
      return novo;
    });
  }

  const total = itens.length;
  const marcados = itens.filter((_, idx) => Boolean(resultados[idx])).length;

  return (
    <div className="modal-overlay">
      <div className="verificacao-modal">
        <div className="verificacao-modal-header">
          <h2>Verificação — {getEtapaLabel(etapa)}</h2>
          <p className="verificacao-subtitle">
            Confirme se tudo foi instalado corretamente · {marcados}/{total}{" "}
            itens marcados
          </p>
        </div>

        <div className="verificacao-modal-body">
          {itens.map((desc, idx) => (
            <div className="verificacao-row" key={idx}>
              <span className="verificacao-numero">{idx + 1}</span>
              <span className="verificacao-desc">{desc}</span>
              <div className="verificacao-actions">
                <button
                  type="button"
                  className={`verificacao-btn ok ${resultados[idx] === "ok" ? "ok-active" : ""}`}
                  onClick={() => toggle(idx, "ok")}
                >
                  <Check size={16} /> OK
                </button>
                <button
                  type="button"
                  className={`verificacao-btn na ${resultados[idx] === "na" ? "na-active" : ""}`}
                  onClick={() => toggle(idx, "na")}
                >
                  <Minus size={16} /> NA
                </button>
                <button
                  type="button"
                  className={`verificacao-btn erro ${resultados[idx] === "erro" ? "erro-active" : ""}`}
                  title="Marcar como erro"
                  onClick={() => toggle(idx, "erro")}
                >
                  <X size={16} /> Erro
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="verificacao-modal-footer">
          <button
            type="button"
            className="verificacao-cancel"
            onClick={onCancel}
          >
            Voltar ao checklist
          </button>
          <button
            type="button"
            className="verificacao-save"
            disabled={marcados !== total}
            onClick={() => onConfirm?.(resultados)}
          >
            Salvar Verificação
          </button>
        </div>
      </div>
    </div>
  );
}
