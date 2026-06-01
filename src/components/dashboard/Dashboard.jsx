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

  const filteredFichas = useMemo(() => {
    if (!searchTerm) return fichaProgress;
    const lower = searchTerm.toLowerCase();
    return fichaProgress.filter(
      (f) =>
        f.id.toLowerCase().includes(lower) ||
        f.nrInd.toLowerCase().includes(lower) ||
        f.nome.toLowerCase().includes(lower),
    );
  }, [fichaProgress, searchTerm]);

  // Recent finalized
  const recentFinalized = fichaProgress
    .filter((f) => ["done", "approved"].includes(f.status))
    .slice(0, 5);

  return (
    <div className="dashboard animate-scaleIn">
      {/* ─── Título ─── */}
      <DashboardHeader total={total} />

      {/* ─── Progresso Geral ─── */}
      <DashboardProgress
        pctGeral={pctGeral}
        itemsOk={itemsOk}
        itemsNa={itemsNa}
        totalItems={totalItems}
      />

      {/* ─── Gráfico Donut + Itens ─── */}
      <div className="dash-grid-2">
        <DashboardDonut
          total={total}
          concluidas={concluidas}
          emAndamento={emAndamento}
          novas={novas}
          reprovadas={reprovadas}
        />

        {/* Itens Verificados */}
        <DashboardItems
          itemsOk={itemsOk}
          itemsNa={itemsNa}
          totalItems={totalItems}
          totalFotos={totalFotos}
        />
      </div>
      {/* ─── Distribuição por Tipo ─── */}
      <DashboardTypeDistribution taf={taf} controle={controle} fotos={fotos} />

      {/* ─── Ranking de Progresso ─── */}
      <DashboardRanking fichas={fichaProgress} />

      {/* ─── Últimas Finalizadas ─── */}
      <DashboardRecent fichas={recentFinalized} />
      {/* ─── Lista Detalhada com Busca ─── */}
      <DashboardTable
        fichas={filteredFichas}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        user={user}
        onApprove={onApprove}
      />

      {/* Empty state */}
      {total === 0 && (
        <div className="dash-empty">
          <p>Crie fichas para visualizar métricas e gráficos aqui.</p>
        </div>
      )}
    </div>
  );
}
