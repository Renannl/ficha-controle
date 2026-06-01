import { useMemo } from "react";
import { OPERACOES } from "../data/fichaTemplate";
import { getFichaStatus, getProgressPct } from "../utils/fichaStatus";

export function useDashboardMetrics(fichas) {
  return useMemo(() => {
    const total = fichas.length;

    let concluidas = 0;
    let reprovadas = 0;
    let emAndamento = 0;
    let novas = 0;

    let totalItems = 0;
    let itemsOk = 0;
    let itemsNa = 0;
    let totalFotos = 0;

    let taf = 0;
    let controle = 0;
    let fotos = 0;

    const fichaProgress = [];

    fichas.forEach((f) => {
      const itemCount = f.items?.length || 0;

      totalItems += itemCount;

      if (f.operacao === "50") taf++;
      else if (f.operacao === "80") fotos++;
      else controle++;

      f.items?.forEach((item) => {
        if (item.foto) totalFotos++;
        if (item.resultado === "ok") itemsOk++;
        if (item.resultado === "na") itemsNa++;
      });

      const done =
        itemCount > 0
          ? f.items.filter((i) => i.resultado === "ok" || i.resultado === "na")
              .length
          : 0;

      const pct = getProgressPct(f);
      const status = getFichaStatus(f);

      if (status === "empty") novas++;
      else if (["progress", "waiting"].includes(status)) emAndamento++;
      else if (status === "rejected") reprovadas++;
      else if (["done", "approved"].includes(status)) concluidas++;

      fichaProgress.push({
        id: f.id,
        nrInd: f.nrInd || "—",
        nome: f.nomeEquipamento || "Sem nome",
        tipo: OPERACOES[f.operacao]?.nome || "—",
        pct,
        done,
        total: itemCount,
        status,
        statusAprovacao: f.statusAprovacao || null,
        criadoEm: f.criadoEm,
        finalizadaAt: f.finalizadaAt,
      });
    });

    const pctGeral =
      totalItems > 0 ? Math.round(((itemsOk + itemsNa) / totalItems) * 100) : 0;

    fichaProgress.sort((a, b) => b.pct - a.pct);

    return {
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
    };
  }, [fichas]);
}
