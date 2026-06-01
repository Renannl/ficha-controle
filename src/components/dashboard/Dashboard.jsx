import { useMemo, useState } from "react";
import { useDashboardMetrics } from "../../hooks/useDashboardMetrics";
import DashboardTable from "./DashboardTable";
import DashboardDonut from "./DashboardDonut";
import DashboardItems from "./DashboardItems";
import DashboardTypeDistribution from "./DashboardTypeDistribution";
import DashboardRanking from "./DashboardRanking";

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
      <div className="dash-title-row">
        <h2 className="dash-title">Dashboard</h2>
        <span className="dash-subtitle">
          {total} ficha{total !== 1 ? "s" : ""} registrada
          {total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ─── Progresso Geral ─── */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h3>Progresso Geral</h3>
          <span className="dash-pct-badge">{pctGeral}%</span>
        </div>
        <div className="dash-progress-bar-lg">
          <div
            className="dash-progress-fill-lg"
            style={{ width: `${pctGeral}%` }}
          />
        </div>
        <div className="dash-progress-legend">
          <span>
            {itemsOk + itemsNa} de {totalItems} itens verificados
          </span>
        </div>
      </div>

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
      {recentFinalized.length > 0 && (
        <div className="dash-section">
          <h3 className="dash-section-h3">Últimas Finalizadas</h3>
          <div className="dash-recent">
            {recentFinalized.map((f) => (
              <div key={f.id} className="dash-recent-item">
                <div className="dash-recent-dot" />
                <div className="dash-recent-info">
                  <div className="dash-recent-name">{f.nome}</div>
                  <div className="dash-recent-type">
                    {f.tipo} · {f.done}/{f.total} itens
                  </div>
                </div>
                <span className="dash-recent-badge">100%</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
