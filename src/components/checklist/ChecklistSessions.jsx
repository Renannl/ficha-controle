export default function ChecklistSessions({
  item,
  index,
  onToggleMark,
  readOnly = false,
}) {
  return (
    <div className="checklist-item-sessions">
      <div className="text-xs font-semibold text-secondary mb-2">
        Sessões de Trabalho (toque para marcar ✔)
        {readOnly && (
          <span style={{ marginLeft: 6, opacity: 0.7 }}>🔒 bloqueado</span>
        )}
      </div>

      <div className="sessions-grid">
        {item.sessionMarks.map((mark, sIdx) => (
          <button
            key={sIdx}
            disabled={readOnly}
            className={`session-mark ${mark === "feito" ? "mark-feito" : ""} ${
              mark === "na" ? "mark-na" : ""
            } ${readOnly ? "readonly" : ""}`}
            onClick={() => {
              if (readOnly) return;
              onToggleMark(index, sIdx, mark === "feito" ? "" : "feito");
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (readOnly) return;
              onToggleMark(index, sIdx, mark === "na" ? "" : "na");
            }}
            title={
              readOnly
                ? "Inicie a sessão de trabalho para editar"
                : `Sessão ${sIdx + 1}: toque = ✔ | segure/clique-direito = NA`
            }
          >
            <span className="mark-number">{sIdx + 1}ª</span>

            {mark === "feito" && "✔"}
            {mark === "na" && "—"}
          </button>
        ))}
      </div>
    </div>
  );
}
