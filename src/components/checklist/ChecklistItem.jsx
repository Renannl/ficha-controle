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
  readOnly = false, // 🔒 nova prop
}) {
  const hideExpand = isTaf || isPainel;

  return (
    <div
      className={`checklist-item ${isExpanded ? "expanded" : ""} ${
        readOnly ? "readonly" : ""
      }`}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      <div
        className="checklist-item-header"
        onClick={() => onToggleExpand(item.id)}
      >
        <div className="checklist-item-number">
          {template?.numero ?? item.id}
        </div>
        <div className="checklist-item-desc">
          {template?.descricao}
          {readOnly && (
            <span
              title="Inicie a sessão de trabalho para editar"
              style={{ marginLeft: 6, fontSize: 12, opacity: 0.7 }}
            >
              🔒
            </span>
          )}
        </div>
        <div className="checklist-item-status">
          <div className="resultado-btns">
            <button
              className={`resultado-btn ${item.resultado === "ok" ? "ok-active" : ""}`}
              disabled={readOnly}
              onClick={(e) => {
                e.stopPropagation();
                if (readOnly) return;
                onResultado(index, "ok");
              }}
            >
              {isTaf ? "C" : "OK"}
            </button>
            <button
              className={`resultado-btn ${item.resultado === "na" ? "na-active" : ""}`}
              disabled={readOnly}
              onClick={(e) => {
                e.stopPropagation();
                if (readOnly) return;
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
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
