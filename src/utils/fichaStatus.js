export function getProgressStatus(ficha) {
  const total = ficha.items?.length || 0;

  if (total === 0) {
    return "empty";
  }

  const done = ficha.items.filter(
    (i) => i.resultado === "ok" || i.resultado === "na",
  ).length;

  if (done === 0) {
    return "empty";
  }

  if (done === total) {
    return "done";
  }

  return "progress";
}

export function getApprovalStatus(ficha) {
  if (ficha.statusAprovacao === "aprovado") {
    return "approved";
  }

  if (ficha.statusAprovacao === "reprovado") {
    return "rejected";
  }

  if (ficha.status === "finalizada" && ficha.statusAprovacao === "aguardando") {
    return "waiting";
  }

  return "none";
}

export function getFichaStatus(ficha) {
  const approval = getApprovalStatus(ficha);

  if (approval !== "none") {
    return approval;
  }

  return getProgressStatus(ficha);
}

export function getProgressPct(ficha) {
  const total = ficha.items?.length || 0;

  if (total === 0) {
    return 0;
  }

  const done = ficha.items.filter(
    (i) => i.resultado === "ok" || i.resultado === "na",
  ).length;

  return Math.round((done / total) * 100);
}
