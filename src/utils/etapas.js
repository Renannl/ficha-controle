export const ETAPA_ORDER = ["montagem", "barramento", "cabeamento"];

export const ETAPA_LABELS = {
  montagem: "Montagem",
  barramento: "Barramento",
  cabeamento: "Cabeamento",
};

export const CARGO_LABELS = {
  montagem: "Montagem Mecânica",
  barramento: "Barramento",
  cabeamento: "Cabeamento",
  admin: "Administrador",
};

export function getEtapaDoCargo(role) {
  return ETAPA_ORDER.includes(role) ? role : null;
}

export function getEtapaLabel(etapa) {
  return ETAPA_LABELS[etapa] || etapa || "—";
}

export function getCargoLabel(cargo) {
  return CARGO_LABELS[cargo] || cargo || "—";
}

// Etapa atual = primeira etapa (na ordem) com item pendente
export function getEtapaAtual(items, checklistItems) {
  for (const etapa of ETAPA_ORDER) {
    const itensDaEtapa = checklistItems.filter((ci) => ci.etapa === etapa);
    if (itensDaEtapa.length === 0) continue;

    const todosConcluidos = itensDaEtapa.every((ci) => {
      const itemData = (items || []).find((i) => i.id === ci.id);
      return itemData?.resultado === "ok" || itemData?.resultado === "na";
    });

    if (!todosConcluidos) return etapa;
  }
  return null; // tudo concluído
}

export function podeTrabalharNaEtapa(user, etapa) {
  if (!etapa) return true; // item sem etapa = sem restrição
  if (!user) return false;
  if (user.role === "admin") return true;
  const etapaDoCargo = getEtapaDoCargo(user.role);
  if (!etapaDoCargo) return true; // role antigo (ex: "producao") = sem restrição
  return etapaDoCargo === etapa;
}
