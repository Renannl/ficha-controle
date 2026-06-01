export default function DashboardRanking({ fichas }) {
  if (!fichas?.length) return null;

  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">Ranking de Progresso</h3>

      <div className="dash-ranking">
        {fichas.slice(0, 8).map((f, i) => (
          <div key={f.id} className="dash-rank-item">
            <span className="dash-rank-pos">#{i + 1}</span>

            <div className="dash-rank-info">
              <div className="dash-rank-name">{f.nome}</div>
              <div className="dash-rank-type">{f.tipo}</div>
            </div>

            <div className="dash-rank-bar-wrap">
              <div className="dash-rank-bar">
                <div
                  className="dash-rank-bar-fill"
                  style={{
                    width: `${f.pct}%`,
                    background:
                      f.status === "approved"
                        ? "var(--green)"
                        : f.status === "waiting"
                          ? "var(--amber)"
                          : f.status === "done"
                            ? "var(--blue)"
                            : f.status === "progress"
                              ? "var(--amber)"
                              : f.status === "rejected"
                                ? "var(--red)"
                                : "var(--border-light)",
                  }}
                />
              </div>
            </div>

            <span className="dash-rank-pct">{f.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
