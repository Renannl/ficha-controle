import { useEffect, useState } from "react";

import TafHeader from "./TafHeader";
import ChecklistSummary from "./ChecklistSummary";
import ChecklistItem from "./ChecklistItem";
import { podeTrabalharNaEtapa } from "../../utils/etapas";

export default function ChecklistTable({
  ficha,
  checklistItems,
  onToggleMark,
  onSetResultado,
  isTaf = false,
  isPainel = false,
  tafData,
  onUpdateTaf,
  user,
  sessaoIniciada,
  onAbrirVerificacao,
}) {
  const [expandedId, setExpandedId] = useState(null);

  const totalItems = ficha.items.length;
  const doneItems = ficha.items.filter(
    (i) => i.resultado === "ok" || i.resultado === "na",
  ).length;
  const pct = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;

  useEffect(() => {
    if (!isTaf) return;
    if (tafData?.dataTermino) return;

    const todosConcluidos =
      Array.isArray(ficha.items) &&
      ficha.items.length > 0 &&
      ficha.items.every((it) => it.resultado === "ok" || it.resultado === "na");

    if (todosConcluidos) {
      const hoje = new Date().toISOString().slice(0, 10);
      onUpdateTaf?.({ dataTermino: hoje });
    }
  }, [ficha.items, isTaf, tafData?.dataTermino, onUpdateTaf]);

  function toggleExpand(id) {
    if (isTaf || isPainel) return;
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function podeEditarItem(item) {
    if (!sessaoIniciada) return false;
    if (!isPainel) return true;
    const template = checklistItems.find((c) => c.id === item.id);
    return podeTrabalharNaEtapa(user, template?.etapa);
  }

  function isItemLiberado(index) {
    if (index === 0) return true;
    const anterior = ficha.items[index - 1];
    return anterior?.resultado === "ok" || anterior?.resultado === "na";
  }

  function handleResultado(index, value, observacao) {
    if (!isItemLiberado(index)) return;
    if (!podeEditarItem(ficha.items[index])) return;
    const current = ficha.items[index].resultado;
    const novoValor = current === value ? "" : value;
    onSetResultado(index, novoValor, novoValor ? observacao : "");
  }

  function handleToggleMark(index, sessionIndex, value) {
    if (!isItemLiberado(index)) return;
    if (!podeEditarItem(ficha.items[index])) return;
    onToggleMark(index, sessionIndex, value);
  }

  let categoriaAnterior = null;

  return (
    <div className="checklist-wrap">
      {isTaf && <TafHeader tafData={tafData} onUpdateTaf={onUpdateTaf} />}

      <ChecklistSummary
        doneItems={doneItems}
        totalItems={totalItems}
        pct={pct}
      />

      {ficha.items.map((item, index) => {
        const template = checklistItems.find((c) => c.id === item.id);
        const categoria = template?.categoria || null;
        const liberado = isItemLiberado(index);

        // 🆕 Pula itens de verificação (serão mostrados no modal)
        if (isPainel && template?.id?.includes("-ver-")) {
          return null;
        }

        const isPrimeiroDaMontagem =
          isPainel &&
          categoria?.startsWith("Sequência de Montagem") &&
          !categoriaAnterior?.startsWith("Sequência de Montagem");

        const isPrimeiroDoBarramento =
          isPainel &&
          categoria?.startsWith("Barramento") &&
          !categoriaAnterior?.startsWith("Barramento");

        const isPrimeiroDoCabeamento =
          isPainel &&
          categoria?.startsWith("Cabeamento") &&
          !categoriaAnterior?.startsWith("Cabeamento");

        categoriaAnterior = categoria;

        // 🆕 Verifica se este é o último item da sequência (Validar todas as etapas anteriores)
        const isUltimoDaSequencia =
          isPainel &&
          template?.descricao?.toLowerCase().includes("validar todas as etapas");

        // 🆕 Verifica se a sequência foi completada
        const sequenciaCompletada = isUltimoDaSequencia && liberado && item.resultado;

        return (
          <div key={item.id}>
            {isPrimeiroDaMontagem && (
              <div className="checklist-titulo-secao">MONTAGEM</div>
            )}

            {isPrimeiroDoBarramento && (
              <div className="checklist-titulo-barramento">BARRAMENTO</div>
            )}

            {isPrimeiroDoCabeamento && (
              <div className="checklist-titulo-secao-cabeamento">
                CABEAMENTO
              </div>
            )}

            <ChecklistItem
              item={item}
              index={index}
              template={template}
              isExpanded={!isTaf && !isPainel && expandedId === item.id}
              isTaf={isTaf}
              isPainel={isPainel}
              onToggleExpand={toggleExpand}
              onToggleMark={handleToggleMark}
              onResultado={handleResultado}
              readOnly={!podeEditarItem(item) || !liberado}
              liberado={liberado}
            />

            {/* 🆕 Botão para abrir verificação após "Validar todas as etapas anteriores" */}
            {sequenciaCompletada && (
              <div className="verificacao-botao-container">
                <button
                  type="button"
                  className="verificacao-botao"
                  onClick={() => onAbrirVerificacao?.(template.etapa)}
                >
                  <span className="verificacao-icone">✓</span>
                  <span>Iniciar Verificação</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
