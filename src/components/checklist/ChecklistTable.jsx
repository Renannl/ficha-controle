import { useState } from "react";

import TafHeader from "./TafHeader";
import ChecklistSummary from "./ChecklistSummary";
import ChecklistItem from "./ChecklistItem";

export default function ChecklistTable({
  ficha,
  checklistItems,
  onToggleMark,
  onSetResultado,
  isTaf = false,
  isPainel = false,
  tafData,
  onUpdateTaf,
  readOnly = false,
}) {
  const [expandedId, setExpandedId] = useState(null);

  const totalItems = ficha.items.length;

  const doneItems = ficha.items.filter(
    (i) => i.resultado === "ok" || i.resultado === "na",
  ).length;

  const pct = Math.round((doneItems / totalItems) * 100);

  function toggleExpand(id) {
    if (isTaf || isPainel) return;
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function isItemLiberado(index) {
    if (index === 0) return true;
    const anterior = ficha.items[index - 1];
    return anterior?.resultado === "ok" || anterior?.resultado === "na";
  }

  function handleResultado(index, value, observacao) {
    if (readOnly) return;
    if (!isItemLiberado(index)) return;
    const current = ficha.items[index].resultado;
    const novoValor = current === value ? "" : value;
    onSetResultado(index, novoValor, novoValor ? observacao : "");
  }

  function handleToggleMark(index, sessionIndex, value) {
    if (readOnly) return;
    if (!isItemLiberado(index)) return;
    onToggleMark(index, sessionIndex, value);
  }

  let categoriaAnterior = null;

  return (
    <div className={`checklist-wrap ${readOnly ? "checklist-readonly" : ""}`}>
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
              readOnly={readOnly || !liberado}
              liberado={liberado}
            />
          </div>
        );
      })}
    </div>
  );
}
