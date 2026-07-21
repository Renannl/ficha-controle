// src/utils/tempoUtils.js

/**
 * Calcula o tempo REAL decorrido da ficha (wall-clock),
 * mesclando intervalos sobrepostos quando duas pessoas trabalham ao mesmo tempo.
 *
 * Ex: Pessoa A trabalha 08h-10h, Pessoa B trabalha 09h-11h
 * -> Overlap entre 09h-10h -> tempo real = 08h às 11h = 3h (não 4h)
 */
export function calcularTempoDecorridoReal(sessoes) {
  if (!sessoes || sessoes.length === 0) return 0;

  const agora = Date.now();

  const intervalos = sessoes
    .map((s) => {
      const inicio = new Date(s.inicio).getTime();
      const fim = s.fim ? new Date(s.fim).getTime() : agora;
      return [inicio, fim];
    })
    .filter(([inicio, fim]) => fim > inicio && !isNaN(inicio) && !isNaN(fim))
    .sort((a, b) => a[0] - b[0]);

  if (intervalos.length === 0) return 0;

  let totalMs = 0;
  let [inicioAtual, fimAtual] = intervalos[0];

  for (let i = 1; i < intervalos.length; i++) {
    const [inicio, fim] = intervalos[i];

    if (inicio <= fimAtual) {
      fimAtual = Math.max(fimAtual, fim);
    } else {
      totalMs += fimAtual - inicioAtual;
      [inicioAtual, fimAtual] = [inicio, fim];
    }
  }

  totalMs += fimAtual - inicioAtual;

  return Math.floor(totalMs / 1000);
}
