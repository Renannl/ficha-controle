import { OPERACOES } from "../../data/fichaTemplate";

import PrintViewOperacao from "./PrintViewOperacao";
import PrintViewTAF from "./PrintViewTAF";
import PrintViewFotos from "./PrintViewFotos";

function getOperacao(operacoes, id) {
  if (!operacoes) return undefined;
  if (Array.isArray(operacoes)) {
    return operacoes.find((o) => o.id === id);
  }
  if (operacoes instanceof Map) {
    return operacoes.get(id);
  }
  // objeto simples { "10": {...}, "50": {...} }
  return operacoes[id];
}

export default function PrintView({ ficha, isBook = false }) {
  const op = getOperacao(OPERACOES, ficha.operacao);

  switch (ficha.operacao) {
    case "80":
      return <PrintViewFotos ficha={ficha} isBook={isBook} />;
    case "50":
      return <PrintViewTAF ficha={ficha} op={op} isBook={isBook} />;
    case "90":
    case "10":
    default:
      return <PrintViewOperacao ficha={ficha} op={op} isBook={isBook} />;
  }
}
