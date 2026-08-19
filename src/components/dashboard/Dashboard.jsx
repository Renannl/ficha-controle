import { useDashboardMetrics } from "../../hooks/useDashboardMetrics";
import DashboardHeader from "./DashboardHeader";
import DashboardKpis from "./DashboardKpis";
import DashboardProgress from "./DashboardProgress";
import DashboardDonut from "./DashboardDonut";
import DashboardQualidade from "./DashboardQualidade";
import DashboardWorkload from "./DashboardWorkload";
import DashboardAprovacoesPendentes from "./DashboardAprovacoesPendentes";
import DashboardTypeDistribution from "./DashboardTypeDistribution";
import DashboardProducaoMensal from "./DashboardProducaoMensal";
import DashboardColaboradores from "./DashboardColaboradores";
import DashboardClientes from "./DashboardClientes";
import DashboardEmpty from "./DashboardEmpty";

export default function Dashboard({ fichas, user, onApprove }) {
  const metrics = useDashboardMetrics(fichas);

  return (
    <div className="dashboard animate-scaleIn">
      <DashboardHeader total={metrics.total} />

      {/* Visão instantânea */}
      <DashboardKpis metrics={metrics} />

      {/* Progresso geral do checklist */}
      <DashboardProgress metrics={metrics} />

      <div className="dash-grid-2">
        <DashboardDonut metrics={metrics} />
        <DashboardQualidade metrics={metrics} />
      </div>

      {/* Gargalos e carga de trabalho */}
      <DashboardWorkload metrics={metrics} />

      {/* Fichas aguardando aprovação (com ação) */}
      <DashboardAprovacoesPendentes
        fichas={metrics.aguardandoAprovacao}
        user={user}
        onApprove={onApprove}
      />

      {/* Mix de operação */}
      <DashboardTypeDistribution metrics={metrics} />

      {/* Tendência de produção */}
      <DashboardProducaoMensal producaoMensal={metrics.producaoMensal} />

      <div className="dash-grid-2">
        <DashboardColaboradores colaboradores={metrics.colaboradores} />
        <DashboardClientes clientes={metrics.clientesRanking} />
      </div>

      <DashboardEmpty total={metrics.total} />
    </div>
  );
}
