export default function DashboardRecent({ fichas }) {
  if (!fichas?.length) return null;

  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">Últimas Finalizadas</h3>

      <div className="dash-recent">
        {fichas.map((f) => (
          <div key={f.id} className="dash-recent-item">
            <div className="dash-recent-dot" />

            <div className="dash-recent-info">
              <div className="dash-recent-name">{f.nome}</div>

              <div className="dash-recent-type">
                {f.tipo} · {f.done}/{f.total} itens
              </div>
            </div>

            <span className="dash-recent-badge">100%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
