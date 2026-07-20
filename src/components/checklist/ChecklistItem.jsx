import ChecklistSessions from "./ChecklistSessions";

export default function ChecklistItem({
  item,
  index,
  template,
  isExpanded,
  isTaf,
  isPainel,
  onToggleExpand,
  onToggleMark,
  onResultado,
}) {
  const hideExpand = isTaf || isPainel;

  return (
    <div
      className={`checklist-item ${isExpanded ? "expanded" : ""}`}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      <div
        className="checklist-item-header"
        onClick={() => onToggleExpand(item.id)}
      >
        <div className="checklist-item-number">{item.id}</div>
        <div className="checklist-item-desc">{template?.descricao}</div>
        <div className="checklist-item-status">
          <div className="resultado-btns">
            <button
              className={`resultado-btn ${item.resultado === "ok" ? "ok-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onResultado(index, "ok");
              }}
            >
              {isTaf ? "C" : "OK"}
            </button>
            <button
              className={`resultado-btn ${item.resultado === "na" ? "na-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onResultado(index, "na");
              }}
            >
              {isTaf ? "NC" : "NA"}
            </button>
          </div>
        </div>
        {!hideExpand && (
          <span className={`expand-arrow ${isExpanded ? "open" : ""}`}>▼</span>
        )}
      </div>

      {isExpanded && !isPainel && (
        <ChecklistSessions
          item={item}
          index={index}
          onToggleMark={onToggleMark}
        />
      )}
    </div>
  );
}
