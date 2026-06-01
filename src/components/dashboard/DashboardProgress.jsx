export default function DashboardProgress({
  pctGeral,
  itemsOk,
  itemsNa,
  totalItems,
}) {
  return (
    <div className="dash-section">
      <div className="dash-section-header">
        <h3>Progresso Geral</h3>
        <span className="dash-pct-badge">{pctGeral}%</span>
      </div>
      <div className="dash-progress-bar-lg">
        <div
          className="dash-progress-fill-lg"
          style={{ width: `${pctGeral}%` }}
        />
      </div>
      <div className="dash-progress-legend">
        <span>
          {itemsOk + itemsNa} de {totalItems} itens verificados
        </span>
      </div>
    </div>
  );
}
