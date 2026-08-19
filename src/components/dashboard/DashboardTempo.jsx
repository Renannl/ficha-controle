function formatarHoras(segundos) {
  const s = Math.floor(Number(segundos) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

export default function DashboardTempo({ metrics }) {
  const media =
    metrics.total > 0 ? Math.round(metrics.totalSegundos / metrics.total) : 0;

  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">⏱️ Tempo Investido</h3>
      <div className="dash-tempo-grid">
        <div className="dash-tempo-item">
          <span className="dash-tempo-value">{formatarHoras(metrics.totalSegundos)}</span>
          <span className="dash-tempo-label">Homem-hora total</span>
        </div>
        <div className="dash-tempo-item">
          <span className="dash-tempo-value">{formatarHoras(media)}</span>
          <span className="dash-tempo-label">Média por ficha</span>
        </div>
        <div className="dash-tempo-item">
          <span className="dash-tempo-value">{metrics.sessoesAtivas}</span>
          <span className="dash-tempo-label">Sessões ativas agora</span>
        </div>
      </div>
    </div>
  );
}
