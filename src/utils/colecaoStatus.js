import { getFichaStatus } from "./fichaStatus";

/**
 * Deriva o status visual da coleção com base no status de cada ficha.
 * Prioridade: erro (rejected) > andamento > completa > vazia
 */
export function getColecaoStatus(fichasDaCol) {
  if (!fichasDaCol || fichasDaCol.length === 0) return "vazia";

  const statusFichas = fichasDaCol.map((f) => getFichaStatus(f));

  // 🔴 Prioridade máxima: alguma ficha reprovada
  const temReprovada = statusFichas.some((s) => s === "rejected");
  if (temReprovada) return "erro";

  // 🟢 Tudo concluído (preenchida ou aprovada)
  const todasCompletas = statusFichas.every(
    (s) => s === "done" || s === "approved",
  );
  if (todasCompletas) return "completa";

  // ⚪ Nenhuma ficha foi iniciada ainda (todas "empty")
  const todasVazias = statusFichas.every((s) => s === "empty");
  if (todasVazias) return "vazia"; // ✅ novo check

  // 🟡 Tem fichas, mas pelo menos uma já foi iniciada (progress, waiting, etc.)
  return "andamento";
}
