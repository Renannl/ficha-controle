import { X, Check, Minus, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { getEtapaLabel } from "../../utils/etapas";

export default function VerificacaoEtapaModal({
  isOpen = false,
  etapa = null,
  itens = [],
  resultados = [],
  onToggle,
  onClose,
  isAdmin = false,
}) {
  if (!isOpen) return null;

  const total = itens.length;
  const marcados = itens.filter((_, idx) => Boolean(resultados[idx])).length;

  // 🆕 Trava por erro
  const temErro = resultados.includes("erro");
  const idxErro = resultados.indexOf("erro"); // -1 se não há erro
  const proximoLivre = itens.findIndex((_, idx) => !resultados[idx]);
  const idxDestaque = temErro ? idxErro : proximoLivre;

  const concluido = marcados === total && !temErro;

  // Marca em sequência: só libera o item se o anterior já estiver marcado.
  // 🆕 Se o anterior estiver com "erro", o próximo NÃO libera.
  function podeMarcar(idx) {
    if (!isAdmin) return false;
    if (idx === 0) return true;
    const anterior = resultados[idx - 1];
    if (anterior === "erro") return false; // erro trava o próximo
    return Boolean(anterior) || Boolean(resultados[idx]);
  }

  return (
    <div className="modal-overlay">
      <div className="verificacao-modal">
        <div className="verificacao-modal-header">
          <h2>Verificação — {getEtapaLabel(etapa)}</h2>
          <p className="verificacao-subtitle">
            Marque um item por vez, na ordem · {marcados}/{total} itens
            {!isAdmin && (
              <span className="verificacao-aviso">
                {" "}
                · Somente administradores podem marcar
              </span>
            )}
          </p>
        </div>

        {/* 🆕 Aviso de erro que trava o checklist */}
        {temErro && (
          <div className="verificacao-alerta-erro">
            <AlertTriangle size={16} />
            <span>
              Item {idxErro + 1} marcado como <strong>ERRO</strong>. Corrija
              (marque OK ou NA) antes de continuar.
            </span>
          </div>
        )}

        <div className="verificacao-modal-body">
          {itens.map((desc, idx) => {
            const marcado = Boolean(resultados[idx]);
            const liberado = podeMarcar(idx);

            return (
              <div
                className={[
                  "verificacao-row",
                  marcado && resultados[idx] !== "erro"
                    ? "verificacao-row--ok"
                    : "",
                  resultados[idx] === "erro" ? "verificacao-row--erro" : "",
                  idx === idxDestaque ? "verificacao-row--next" : "",
                  !liberado && !marcado ? "verificacao-row--locked" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={idx}
              >
                <span className="verificacao-numero">
                  {marcado ? <Check size={14} /> : idx + 1}
                </span>
                <span className="verificacao-desc">{desc}</span>

                <div className="verificacao-actions">
                  <button
                    type="button"
                    className={`verificacao-btn ok ${resultados[idx] === "ok" ? "ok-active" : ""}`}
                    onClick={() => onToggle?.(idx, "ok")}
                    disabled={!liberado}
                  >
                    <Check size={16} /> OK
                  </button>
                  <button
                    type="button"
                    className={`verificacao-btn na ${resultados[idx] === "na" ? "na-active" : ""}`}
                    onClick={() => onToggle?.(idx, "na")}
                    disabled={!liberado}
                  >
                    <Minus size={16} /> NA
                  </button>
                  <button
                    type="button"
                    className={`verificacao-btn erro ${resultados[idx] === "erro" ? "erro-active" : ""}`}
                    title="Marcar como erro"
                    onClick={() => onToggle?.(idx, "erro")}
                    disabled={!liberado}
                  >
                    <X size={16} /> Erro
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="verificacao-modal-footer">
          <button type="button" className="verificacao-voltar" onClick={onClose}>
            <ArrowLeft size={16} /> Voltar para a ficha
          </button>

          <button
            type="button"
            className="verificacao-concluir"
            disabled={!concluido}
            onClick={onClose}
          >
            <CheckCircle2 size={16} /> Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
