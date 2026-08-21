import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  Target,
  Activity,
  Timer,
} from "lucide-react";

function formatarHoras(segundos) {
  const s = Math.floor(Number(segundos) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

export default function DashboardKpis({ metrics }) {
  const cards = [
    { label: "Fichas", value: metrics.total, Icon: ClipboardList, color: "#3b82f6" },
    { label: "Em andamento", value: metrics.emAndamento, Icon: Clock3, color: "#f59e0b" },
    { label: "Concluídas", value: metrics.concluidas, Icon: CheckCircle2, color: "#22c55e" },
    { label: "Taxa de aprovação", value: `${metrics.taxaAprovacao}%`, Icon: Target, color: "#8b5cf6" },
    { label: "Em atividade agora", value: metrics.sessoesAtivas, Icon: Activity, color: "#ef4444" },
    { label: "Horas investidas", value: formatarHoras(metrics.totalSegundos), Icon: Timer, color: "#06b6d4" },
  ];

  return (
    <div className="dash-kpis">
      {cards.map(({ label, value, Icon, color }) => (
        <div key={label} className="dash-kpi" style={{ borderTopColor: color }}>
          <span className="dash-kpi-icon" style={{ background: `${color}1a` }}>
            <Icon size={20} style={{ color }} />
          </span>
          <div className="dash-kpi-body">
            <span className="dash-kpi-value" style={{ color }}>{value}</span>
            <span className="dash-kpi-label">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
