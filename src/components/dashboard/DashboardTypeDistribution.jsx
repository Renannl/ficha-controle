export default function DashboardTypeDistribution({ metrics }) {
  const { producao, taf, fotos, qualidade } = metrics;
  const typeMax = Math.max(producao, taf, fotos, qualidade, 1);

  const rows = [
    { label: "Produção", value: producao, cls: "dash-type-producao" },
    { label: "TAF", value: taf, cls: "dash-type-taf" },
    { label: "Fotos", value: fotos, cls: "dash-type-fotos" },
    { label: "Qualidade", value: qualidade, cls: "dash-type-qualidade" },
  ];

  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">Distribuição por Tipo de Operação</h3>
      <div className="dash-type-bars">
        {rows.map((r) => (
          <div key={r.label} className="dash-type-row">
            <span className="dash-type-label">{r.label}</span>
            <div className="dash-type-bar-track">
              <div
                className={`dash-type-bar-fill ${r.cls}`}
                style={{ width: `${(r.value / typeMax) * 100}%` }}
              />
            </div>
            <span className="dash-type-count">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
