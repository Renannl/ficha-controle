export default function DashboardAprovacao({ metrics }) {
  const { qtdAprovadas, qtdReprovadas, qtdAguardando, qtdRevisao, taxaAprovacao } = metrics;

  const rows = [
    { label: "Aprovadas", value: qtdAprovadas, color: "var(--green)" },
    { label: "Reprovadas", value: qtdReprovadas, color: "var(--red)" },
    { label: "Aguardando", value: qtdAguardando, color: "var(--amber)" },
    { label: "Em revisão", value: qtdRevisao, color: "var(--blue-accent, #3b82f6)" },
  ];

  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">🛡️ Fluxo de Aprovação</h3>

      <div className="dash-aprovacao-rate">
        <div className="dash-aprovacao-big">{taxaAprovacao}%</div>
        <div className="dash-aprovacao-big-label">taxa de aprovação</div>
      </div>

      <div className="dash-aprovacao-list">
        {rows.map((r) => (
          <div key={r.label} className="dash-aprovacao-row">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className="dash-aprovacao-dot"
                style={{ background: r.color }}
              />
              {r.label}
            </span>
            <strong>{r.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
