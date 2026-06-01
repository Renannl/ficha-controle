export default function DashboardDonut({
  total,
  concluidas,
  emAndamento,
  novas,
  reprovadas,
}) {
  const donutConcluida = total > 0 ? (concluidas / total) * 100 : 0;
  const donutAndamento = total > 0 ? (emAndamento / total) * 100 : 0;
  const donutNova = total > 0 ? (novas / total) * 100 : 0;
  const donutReprovadas = total > 0 ? (reprovadas / total) * 100 : 0;

  const conicGradient =
    total > 0
      ? `conic-gradient(
          var(--green) 0% ${donutConcluida}%,
          var(--amber)
          ${donutConcluida}%
          ${donutConcluida + donutAndamento}%,
          var(--red)
          ${donutConcluida + donutAndamento}%
          ${donutConcluida + donutAndamento + donutReprovadas}%,
          var(--text-muted)
          ${donutConcluida + donutAndamento + donutReprovadas}%
          100%
        )`
      : `conic-gradient(var(--border) 0% 100%)`;

  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">Status das Fichas</h3>

      <div className="dash-donut-wrap">
        <div className="dash-donut" style={{ background: conicGradient }}>
          <div className="dash-donut-hole">
            <span className="dash-donut-value">{total}</span>
            <span className="dash-donut-label">fichas</span>
          </div>
        </div>
      </div>

      <div className="dash-donut-legend">
        <div className="dash-legend-item">
          <span
            className="dash-legend-dot"
            style={{ background: "var(--green)" }}
          />
          <span>Concluídas ({concluidas})</span>
        </div>

        <div className="dash-legend-item">
          <span
            className="dash-legend-dot"
            style={{ background: "var(--amber)" }}
          />
          <span>Andamento ({emAndamento})</span>
        </div>

        <div className="dash-legend-item">
          <span
            className="dash-legend-dot"
            style={{ background: "var(--red)" }}
          />
          <span>Reprovadas ({reprovadas})</span>
        </div>

        <div className="dash-legend-item">
          <span
            className="dash-legend-dot"
            style={{ background: "var(--text-muted)" }}
          />
          <span>Novas ({novas})</span>
        </div>
      </div>
    </div>
  );
}
