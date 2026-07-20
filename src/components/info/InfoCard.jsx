import { OPERACOES } from "../../data/fichaTemplate";

import InfoDocumentSection from "./InfoDocumentSection";
import InfoEquipmentSection from "./InfoEquipmentSection";
import InfoPlanningSection from "./InfoPlanningSection";
import OperationInfoBanner from "./OperationInfoBanner";

export default function InfoCard({
  ficha,
  onChange,
  onOperacaoChange,
  onTipoPainelChange,
}) {
  const operacaoAtual = OPERACOES[ficha.operacao];
  const handle = (field) => (e) => onChange(field, e.target.value);

  // Cliente vem da coleção vinculada; se não houver coleção, cai no valor legado da própria ficha
  const clienteTravado = ficha.colecao?.cliente ?? ficha.cliente ?? "";

  return (
    <div className="info-section">
      <InfoDocumentSection ficha={ficha} handle={handle} />

      <InfoEquipmentSection
        ficha={ficha}
        handle={handle}
        clienteTravado={clienteTravado}
      />

      <InfoPlanningSection
        ficha={ficha}
        handle={handle}
        operacaoAtual={operacaoAtual}
        onOperacaoChange={onOperacaoChange}
        onTipoPainelChange={onTipoPainelChange} // ← e aqui
      />

      <OperationInfoBanner />
    </div>
  );
}
