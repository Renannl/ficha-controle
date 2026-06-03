export function calcHours(hIni, hFim) {
  if (!hIni || !hFim) return "";

  const [h1, m1] = hIni.split(":").map(Number);
  const [h2, m2] = hFim.split(":").map(Number);

  const mins = h2 * 60 + m2 - (h1 * 60 + m1);

  if (mins <= 0) return "";

  const h = Math.floor(mins / 60);
  const m = mins % 60;

  return `${h}h${m > 0 ? String(m).padStart(2, "0") : ""}`;
}

export function calcTotalMinutes(sessions) {
  return sessions.reduce((sum, s) => {
    if (!s.hIni || !s.hFim) return sum;

    const [h1, m1] = s.hIni.split(":").map(Number);
    const [h2, m2] = s.hFim.split(":").map(Number);

    const mins = h2 * 60 + m2 - (h1 * 60 + m1);

    return sum + (mins > 0 ? mins : 0);
  }, 0);
}
