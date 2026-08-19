export default function DashboardClientes({ clientes }) {
  if (!clientes?.length) return null;

  const max = clientes[0].qtd;

  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">🏢 Fichas por Cliente</h3>
      <div className="dash-cliente-list">
        {clientes.slice(0, 8).map((c) => (
          <div key={c.nome} className="dash-cliente-item">
            <span className="dash-cliente-nome">{c.nome}</span>
            <div className="dash-cliente-bar">
              <div
                className="dash-cliente-fill"
                style={{ width: `${(c.qtd / max) * 100}%` }}
              />
            </div>
            <span className="dash-cliente-count">{c.qtd}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
