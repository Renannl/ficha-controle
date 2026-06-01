export default function DashboardTypeDistribution({ taf, controle, fotos }) {
  const typeMax = Math.max(taf, controle, fotos, 1);

  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">Distribuição por Tipo</h3>

      <div className="dash-type-bars">
        <div className="dash-type-row">
          <span className="dash-type-label">TAF</span>

          <div className="dash-type-bar-track">
            <div
              className="dash-type-bar-fill dash-type-taf"
              style={{ width: `${(taf / typeMax) * 100}%` }}
            />
          </div>

          <span className="dash-type-count">{taf}</span>
        </div>

        <div className="dash-type-row">
          <span className="dash-type-label">Controle</span>

          <div className="dash-type-bar-track">
            <div
              className="dash-type-bar-fill dash-type-controle"
              style={{ width: `${(controle / typeMax) * 100}%` }}
            />
          </div>

          <span className="dash-type-count">{controle}</span>
        </div>

        <div className="dash-type-row">
          <span className="dash-type-label">Fotos</span>

          <div className="dash-type-bar-track">
            <div
              className="dash-type-bar-fill dash-type-fotos"
              style={{ width: `${(fotos / typeMax) * 100}%` }}
            />
          </div>

          <span className="dash-type-count">{fotos}</span>
        </div>
      </div>
    </div>
  );
}
