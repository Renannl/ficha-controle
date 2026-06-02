import { OPERACOES } from "../../data/fichaTemplate";

import InfoDocumentSection from "./InfoDocumentSection";
import InfoEquipmentSection from "./InfoEquipmentSection";
import InfoPlanningSection from "./InfoPlanningSection";
import OperationInfoBanner from "./OperationInfoBanner";

export default function InfoCard({
  ficha,
  onChange,
  onOperacaoChange,
}) {
  const operacaoAtual = OPERACOES[ficha.operacao];

  const handle =
    (field) =>
    (e) =>
      onChange(field, e.target.value);

  return (
    <div className="info-section">
      <InfoDocumentSection
        ficha={ficha}
        handle={handle}
      />

      <InfoEquipmentSection
        ficha={ficha}
        handle={handle}
      />

      <InfoPlanningSection
        ficha={ficha}
        handle={handle}
        operacaoAtual={operacaoAtual}
        onOperacaoChange={onOperacaoChange}
      />

      <OperationInfoBanner />
    </div>
  );
}