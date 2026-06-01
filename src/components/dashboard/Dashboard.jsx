import { useMemo, useState } from "react";
import { useDashboardMetrics } from "../../hooks/useDashboardMetrics";
import DashboardTable from "./DashboardTable";
import DashboardDonut from "./DashboardDonut";
import DashboardItems from "./DashboardItems";
import DashboardTypeDistribution from "./DashboardTypeDistribution";
import DashboardRanking from "./DashboardRanking";
import DashboardRecent from "./DashboardRecent";
import DashboardProgress from "./DashboardProgress";
import DashboardHeader from "./DashboardHeader";
import DashboardEmpty from "./DashboardEmpty";
import useFilteredFichas from "../../hooks/useFilteredFichas";
import useRecentFinalized from "../../hooks/useRecentFInalized";

export default function Dashboard({ fichas, user, onApprove }) {
  const [searchTerm, setSearchTerm] = useState("");
  const metrics = useDashboardMetrics(fichas);

  const {
    total,
    concluidas,
    emAndamento,
    novas,
    reprovadas,
    totalItems,
    itemsOk,
    itemsNa,
    totalFotos,
    taf,
    controle,
    fotos,
    pctGeral,
    fichaProgress,
  } = metrics;

  const filteredFichas = useFilteredFichas(fichaProgress, searchTerm);

  const recentFinalized = useRecentFinalized(fichaProgress);

  return (
    <div className="dashboard animate-scaleIn">
      <DashboardHeader total={total} />

      <DashboardProgress
        pctGeral={pctGeral}
        itemsOk={itemsOk}
        itemsNa={itemsNa}
        totalItems={totalItems}
      />

      <div className="dash-grid-2">
        <DashboardDonut
          total={total}
          concluidas={concluidas}
          emAndamento={emAndamento}
          novas={novas}
          reprovadas={reprovadas}
        />

        <DashboardItems
          itemsOk={itemsOk}
          itemsNa={itemsNa}
          totalItems={totalItems}
          totalFotos={totalFotos}
        />
      </div>

      <DashboardTypeDistribution taf={taf} controle={controle} fotos={fotos} />

      <DashboardRanking fichas={fichaProgress} />

      <DashboardRecent fichas={recentFinalized} />

      <DashboardTable
        fichas={filteredFichas}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        user={user}
        onApprove={onApprove}
      />

      <DashboardEmpty total={total} />
    </div>
  );
}
