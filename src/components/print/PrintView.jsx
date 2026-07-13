import { OPERACOES } from "../../data/fichaTemplate";

import PrintViewOperacao from "./PrintViewOperacao";
import PrintViewTAF from "./PrintViewTAF";
import PrintViewFotos from "./PrintViewFotos";

export default function PrintView({ ficha, isBook = false }) {
  switch (ficha.operacao) {
    case "80":
      return <PrintViewFotos ficha={ficha} isBook={isBook} />;
    case "50":
      return <PrintViewTAF ficha={ficha} isBook={isBook} />;
    case "90":
    case "10":
    default:
      return <PrintViewOperacao ficha={ficha} isBook={isBook} />;
  }
}
