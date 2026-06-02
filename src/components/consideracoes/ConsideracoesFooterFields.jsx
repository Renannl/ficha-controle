export default function ConsideracoesFooterFields({
  fotoData,
  onUpdateFotoData,
}) {
  return (
    <div className="consideracoes-footer-fields">
      <div className="field">
        <label>Responsável Técnico</label>

        <input
          className="consideracoes-input"
          type="text"
          value={fotoData.responsavelTecnico || ""}
          onChange={(e) =>
            onUpdateFotoData({
              responsavelTecnico: e.target.value,
            })
          }
        />
      </div>

      <div className="field">
        <label>Data / Hora de Início</label>

        <input
          className="consideracoes-input"
          type="text"
          value={fotoData.dataHoraInicio || ""}
          onChange={(e) =>
            onUpdateFotoData({
              dataHoraInicio: e.target.value,
            })
          }
          placeholder="Ex: 21/08/2023 | 07:00h"
        />
      </div>
    </div>
  );
}
