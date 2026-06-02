import { OPERACOES } from "../../data/fichaTemplate";

export default function HeaderInfo({ ficha }) {
  const opLabel = OPERACOES[ficha.operacao]?.label || ficha.operacao;

  return (
    <div className="header-info-wrap">
      <img src="/ip.png" alt="Logo" className="header-logo" />

      <div className="header-info">
        <div className="header-title">
          {ficha.nomeEquipamento || "Nova Ficha"}
        </div>

        <div className="header-sub">
          {ficha.codigo} · {opLabel}
        </div>

        <span className="header-sub">
          Criada por: {ficha.criadoPor || "-"}
        </span>
      </div>
    </div>
  );
}