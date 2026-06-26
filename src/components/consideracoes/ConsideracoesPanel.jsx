import ConsideracoesHeaderFields from "./ConsideracoesHeaderFields";
import ConsideracoesTable from "./ConsideracoesTable";
import ConsideracoesObservacoes from "./ConsideracoesObservacoes";
import ConsideracoesFooterFields from "./ConsideracoesFooterFields";

export default function ConsideracoesPanel({ ficha, onUpdateHeader, onUpdateFotoData }) {
  const fotoData = ficha?.fotoData ?? {
    verificacoes: [],
    responsavelTecnico: "",
    dataHoraInicio: "",
  };

  return (
    <div className="info-section bg-card card-glow">
      <ConsideracoesHeaderFields ficha={ficha} onUpdateHeader={onUpdateHeader} />
      <ConsideracoesTable verificacoes={fotoData.verificacoes} onUpdateFotoData={onUpdateFotoData} />
      <ConsideracoesObservacoes observacoes={ficha.observacoes} onUpdateHeader={onUpdateHeader} />
      <ConsideracoesFooterFields fotoData={fotoData} onUpdateFotoData={onUpdateFotoData} />
    </div>
  );
}
