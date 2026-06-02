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
  tafData,
  onUpdateTaf,
}) {
  const [expandedId, setExpandedId] = useState(null);

  const totalItems = ficha.items.length;

  const doneItems = ficha.items.filter(
    (i) => i.resultado === "ok" || i.resultado === "na",
  ).length;

  const pct = Math.round((doneItems / totalItems) * 100);

  function toggleExpand(id) {
    if (isTaf) return;

    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleResultado(index, value) {
    const current = ficha.items[index].resultado;

    onSetResultado(index, current === value ? "" : value);
  }

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

        return (
          <ChecklistItem
            key={item.id}
            item={item}
            index={index}
            template={template}
            isExpanded={!isTaf && expandedId === item.id}
            isTaf={isTaf}
            onToggleExpand={toggleExpand}
            onToggleMark={onToggleMark}
            onResultado={handleResultado}
          />
        );
      })}
    </div>
  );
}
