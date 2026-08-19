function formatarHoras(segundos) {
  const s = Math.floor(Number(segundos) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

export default function DashboardWorkload({ metrics }) {
  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">Carga de Trabalho & Gargalos</h3>
      <div className="dash-workload-grid">
        <div className="dash-workload-item">
          <span className="dash-workload-value" style={{ color: "var(--amber)" }}>
            {metrics.itemsPendentes}
          </span>
          <span className="dash-workload-label">itens pendentes de verificação</span>
        </div>

        <div className="dash-workload-item">
          <span className="dash-workload-value" style={{ color: "var(--red)" }}>
            {metrics.fichasParadas}
          </span>
          <span className="dash-workload-label">fichas paradas (sem ninguém atuando)</span>
        </div>

        <div className="dash-workload-item">
          <span className="dash-workload-value">{formatarHoras(metrics.mediaTempoPorFicha)}</span>
          <span className="dash-workload-label">tempo médio por ficha</span>
        </div>
      </div>
    </div>
  );
}
