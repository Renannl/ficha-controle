export default function ChecklistSummary({ doneItems, totalItems, pct }) {
  return (
    <div className="checklist-summary">
      <span className="summary-text">
        {doneItems}/{totalItems} itens
      </span>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <span className="summary-text">{pct}%</span>
    </div>
  );
}
