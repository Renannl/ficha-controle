import { OPERACOES } from "../../data/fichaTemplate";

import PrintViewOperacao from "./PrintViewOperacao";
import PrintViewTAF from "./PrintViewTAF";
import PrintViewFotos from "./PrintViewFotos";

export default function PrintView({ ficha, isBook = false }) {
  const op = OPERACOES[ficha.operacao];

  if (ficha.tafData) {
    return <PrintViewTAF ficha={ficha} op={op} isBook={isBook} />;
  }

  if (ficha.operacao === "80") {
    return <PrintViewFotos ficha={ficha} isBook={isBook} />;
  }

  return <PrintViewOperacao ficha={ficha} op={op} isBook={isBook} />;
}
