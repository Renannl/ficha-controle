export default function DashboardProgress({ metrics }) {
  const verificados = metrics.itemsOk + metrics.itemsNa;

  return (
    <div className="dash-section">
      <div className="dash-section-header">
        <h3 className="dash-section-h3">Progresso Geral do Checklist</h3>
        <span className="dash-pct-badge">{metrics.pctGeral}%</span>
      </div>
      <div className="dash-progress-bar-lg">
        <div className="dash-progress-fill-lg" style={{ width: `${metrics.pctGeral}%` }} />
      </div>
      <div className="dash-progress-legend">
        <span>{verificados} de {metrics.totalItems} itens verificados</span>
      </div>
    </div>
  );
}
