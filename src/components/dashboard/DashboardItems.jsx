export default function DashboardItems({
  itemsOk,
  itemsNa,
  totalItems,
  totalFotos,
}) {
  const pendentes = totalItems - itemsOk - itemsNa;

  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">Itens Verificados</h3>

      <div className="dash-items-summary">
        <div className="dash-item-stat">
          <div
            className="dash-item-stat-value"
            style={{ color: "var(--green)" }}
          >
            {itemsOk}
          </div>

          <div className="dash-item-stat-label">OK ✓</div>

          <div className="dash-item-stat-bar">
            <div
              className="dash-item-stat-fill"
              style={{
                width: `${totalItems > 0 ? (itemsOk / totalItems) * 100 : 0}%`,
                background: "var(--green)",
              }}
            />
          </div>
        </div>

        <div className="dash-item-stat">
          <div className="dash-item-stat-value" style={{ color: "var(--red)" }}>
            {itemsNa}
          </div>

          <div className="dash-item-stat-label">N/A ✗</div>

          <div className="dash-item-stat-bar">
            <div
              className="dash-item-stat-fill"
              style={{
                width: `${totalItems > 0 ? (itemsNa / totalItems) * 100 : 0}%`,
                background: "var(--red)",
              }}
            />
          </div>
        </div>

        <div className="dash-item-stat">
          <div
            className="dash-item-stat-value"
            style={{ color: "var(--text-muted)" }}
          >
            {pendentes}
          </div>

          <div className="dash-item-stat-label">Pendente</div>

          <div className="dash-item-stat-bar">
            <div
              className="dash-item-stat-fill"
              style={{
                width: `${totalItems > 0 ? (pendentes / totalItems) * 100 : 0}%`,
                background: "var(--border-light)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="dash-foto-stat">
        <span className="dash-foto-count">{totalFotos}</span>

        <span className="dash-foto-label">
          foto{totalFotos !== 1 ? "s" : ""} registrada
          {totalFotos !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
