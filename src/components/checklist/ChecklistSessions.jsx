export default function ChecklistSessions({ item, index, onToggleMark }) {
  return (
    <div className="checklist-item-sessions">
      <div className="text-xs font-semibold text-secondary mb-2">
        Sessões de Trabalho (toque para marcar ✔)
      </div>

      <div className="sessions-grid">
        {item.sessionMarks.map((mark, sIdx) => (
          <button
            key={sIdx}
            className={`session-mark ${mark === "feito" ? "mark-feito" : ""} ${
              mark === "na" ? "mark-na" : ""
            }`}
            onClick={() =>
              onToggleMark(index, sIdx, mark === "feito" ? "" : "feito")
            }
            onContextMenu={(e) => {
              e.preventDefault();

              onToggleMark(index, sIdx, mark === "na" ? "" : "na");
            }}
            title={`Sessão ${sIdx + 1}: toque = ✔ | segure/clique-direito = NA`}
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
