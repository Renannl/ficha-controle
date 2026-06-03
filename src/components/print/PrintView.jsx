import { OPERACOES } from "../../data/fichaTemplate";

import PrintViewOperacao from "./PrintViewOperacao";
import PrintViewTAF from "./PrintViewTAF";
import PrintViewFotos from "./PrintViewFotos";

export default function PrintView({ ficha }) {
  const op = OPERACOES[ficha.operacao];

  if (ficha.tafData) {
    return <PrintViewTAF ficha={ficha} op={op} />;
  }

  if (ficha.operacao === "80") {
    return <PrintViewFotos ficha={ficha} />;
  }

  return <PrintViewOperacao ficha={ficha} op={op} />;
}
