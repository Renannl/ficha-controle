import { OPERACOES } from "../data/fichaTemplate";
import { hasPermission } from "./hasPermission";

export function getAvailableOperations(user) {
  return Object.values(OPERACOES).filter((op) => {
    if (op.codigo === "50") return hasPermission(user, "taf");
    if (op.codigo === "80") return hasPermission(user, "fotos");
    return hasPermission(user, "controle");
  });
}