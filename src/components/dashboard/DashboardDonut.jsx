import { PieChart } from "lucide-react";

export default function DashboardDonut({ metrics }) {
  const { total, concluidas, emAndamento, novas, reprovadas } = metrics;

  const pConcluida = total > 0 ? (concluidas / total) * 100 : 0;
  const pAndamento = total > 0 ? (emAndamento / total) * 100 : 0;
  const pReprovada = total > 0 ? (reprovadas / total) * 100 : 0;

  const conicGradient =
    total > 0
      ? `conic-gradient(
          var(--green) 0% ${pConcluida}%,
          var(--amber) ${pConcluida}% ${pConcluida + pAndamento}%,
          var(--red) ${pConcluida + pAndamento}% ${pConcluida + pAndamento + pReprovada}%,
          var(--text-muted) ${pConcluida + pAndamento + pReprovada}% 100%
        )`
      : `conic-gradient(var(--border) 0% 100%)`;

  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">
        <PieChart size={16} /> Status das Fichas
      </h3>

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
          <span className="dash-legend-dot" style={{ background: "var(--green)" }} />
          <span>Concluídas ({concluidas})</span>
        </div>
        <div className="dash-legend-item">
          <span className="dash-legend-dot" style={{ background: "var(--amber)" }} />
          <span>Em andamento ({emAndamento})</span>
        </div>
        <div className="dash-legend-item">
          <span className="dash-legend-dot" style={{ background: "var(--red)" }} />
          <span>Reprovadas ({reprovadas})</span>
        </div>
        <div className="dash-legend-item">
          <span className="dash-legend-dot" style={{ background: "var(--text-muted)" }} />
          <span>Novas ({novas})</span>
        </div>
      </div>
    </div>
  );
}
