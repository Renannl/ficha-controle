function formatarHoras(segundos) {
  const s = Math.floor(Number(segundos) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

export default function DashboardKpis({ metrics }) {
  const cards = [
    { label: "Fichas", value: metrics.total, icon: "📋", color: "#3b82f6" },
    { label: "Em andamento", value: metrics.emAndamento, icon: "🕐", color: "#f59e0b" },
    { label: "Concluídas", value: metrics.concluidas, icon: "✅", color: "#22c55e" },
    { label: "Taxa de aprovação", value: `${metrics.taxaAprovacao}%`, icon: "🎯", color: "#8b5cf6" },
    { label: "Em atividade agora", value: metrics.sessoesAtivas, icon: "🔴", color: "#ef4444" },
    { label: "Horas investidas", value: formatarHoras(metrics.totalSegundos), icon: "⏱️", color: "#06b6d4" },
  ];

  return (
    <div className="dash-kpis">
      {cards.map((c) => (
        <div key={c.label} className="dash-kpi" style={{ borderTopColor: c.color }}>
          <span className="dash-kpi-icon" style={{ background: `${c.color}1a` }}>
            {c.icon}
          </span>
          <div className="dash-kpi-body">
            <span className="dash-kpi-value" style={{ color: c.color }}>{c.value}</span>
            <span className="dash-kpi-label">{c.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
