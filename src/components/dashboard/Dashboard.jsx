import { useDashboardMetrics } from "../../hooks/useDashboardMetrics";
import DashboardHeader from "./DashboardHeader";
import DashboardKpis from "./DashboardKpis";
import DashboardProgress from "./DashboardProgress";
import DashboardDonut from "./DashboardDonut";
import DashboardQualidade from "./DashboardQualidade";
import DashboardCapacity from "./DashboardCapacity";
import DashboardProducaoMensal from "./DashboardProducaoMensal";
import DashboardColaboradores from "./DashboardColaboradores";
import DashboardClientes from "./DashboardClientes";
import DashboardEmpty from "./DashboardEmpty";

export default function Dashboard({ fichas, user, onApprove, usuarios }) {
  const metrics = useDashboardMetrics(fichas);

  return (
    <div className="dashboard animate-scaleIn">
      <DashboardHeader total={metrics.total} />

      <DashboardKpis metrics={metrics} />
      <DashboardProgress metrics={metrics} />

      <div className="dash-grid-2">
        <DashboardDonut metrics={metrics} />
        <DashboardQualidade metrics={metrics} />
        {console.log("[DEBUG] usuarios:", usuarios)}{" "}
      </div>

      <DashboardCapacity fichas={fichas} usuarios={usuarios} />

      <DashboardProducaoMensal producaoMensal={metrics.producaoMensal} />

      <div className="dash-grid-2">
        <DashboardColaboradores colaboradores={metrics.colaboradores} />
        <DashboardClientes clientes={metrics.clientesRanking} />
      </div>

      <DashboardEmpty total={metrics.total} />
    </div>
  );
}
