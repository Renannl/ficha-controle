import { ShieldCheck } from "lucide-react";

export default function DashboardQualidade({ metrics }) {
  const { itemsOk, itemsNa, itemsErro, itemsPendentes } = metrics;
  const { qtdAprovadas, qtdReprovadas, qtdAguardando, qtdRevisao, taxaAprovacao } = metrics;

  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">
        <ShieldCheck size={16} /> Qualidade & Aprovação
      </h3>

      <div className="dash-aprovacao-rate">
        <div className="dash-aprovacao-big">{taxaAprovacao}%</div>
        <div className="dash-aprovacao-big-label">taxa de aprovação</div>
      </div>

      <div className="dash-qualidade-grid">
        <div className="dash-qualidade-item" style={{ color: "var(--green)" }}>
          <strong>{itemsOk}</strong><span>OK</span>
        </div>
        <div className="dash-qualidade-item" style={{ color: "var(--amber)" }}>
          <strong>{itemsNa}</strong><span>N/A</span>
        </div>
        <div className="dash-qualidade-item" style={{ color: "var(--red)" }}>
          <strong>{itemsErro}</strong><span>Erros</span>
        </div>
        <div className="dash-qualidade-item" style={{ color: "var(--text-muted)" }}>
          <strong>{itemsPendentes}</strong><span>Pendentes</span>
        </div>
      </div>

      <div className="dash-aprovacao-list">
        <div className="dash-aprovacao-row">
          <span><span className="dash-aprovacao-dot" style={{ background: "var(--green)" }} />Aprovadas</span>
          <strong>{qtdAprovadas}</strong>
        </div>
        <div className="dash-aprovacao-row">
          <span><span className="dash-aprovacao-dot" style={{ background: "var(--red)" }} />Reprovadas</span>
          <strong>{qtdReprovadas}</strong>
        </div>
        <div className="dash-aprovacao-row">
          <span><span className="dash-aprovacao-dot" style={{ background: "var(--amber)" }} />Aguardando</span>
          <strong>{qtdAguardando}</strong>
        </div>
        <div className="dash-aprovacao-row">
          <span><span className="dash-aprovacao-dot" style={{ background: "#3b82f6" }} />Em revisão</span>
          <strong>{qtdRevisao}</strong>
        </div>
      </div>
    </div>
  );
}
