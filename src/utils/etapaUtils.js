// utils/etapaUtils.js
import { getPainelChecklistItems } from "../data/painelTemplates";

/**
 * Retorna um mapa { itemId: etapa } para um tipo de painel específico.
 * Ex: { 1: "montagem_mecanica", 2: "montagem_mecanica", 8: "barramento", ... }
 */
export function getMapaEtapasPorItem(tipoPainel) {
  const items = getPainelChecklistItems(tipoPainel, {
    incluirVerificacao: false,
  });
  const mapa = {};
  items.forEach((item) => {
    mapa[item.id] = item.etapa;
  });
  return mapa;
}

export const ETAPA_LABELS = {
  montagem_mecanica: "Montagem Mecânica",
  barramento: "Barramento",
  cabeamento: "Cabeamento",
};
