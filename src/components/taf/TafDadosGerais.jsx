export default function TafDadosGerais({
  ficha,
  tafData,
  onUpdate,
  handleChange,
}) {
  return (
    <>
      <div className="card-header-simple">
        <h2>Relatório de Ensaios TAF</h2>
        <p>Versão 1.3</p>
      </div>

      <div className="taf-grid">
        <div className="taf-check-options">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={tafData.testExecutedWithClient}
              onChange={(e) =>
                handleChange("testExecutedWithClient", e.target.checked)
              }
            />
            <span>Executado COM o cliente</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={tafData.testExecutedWithoutClient}
              onChange={(e) =>
                handleChange("testExecutedWithoutClient", e.target.checked)
              }
            />
            <span>Executado SEM o cliente</span>
          </label>
        </div>

        <div className="taf-form-row">
          <div className="taf-input-group">
            <label>Nome do Quadro/Painel</label>
            <input
              type="text"
              value={ficha.nomeEquipamento || ""}
              onChange={(e) =>
                onUpdate({
                  nomeEquipamento: e.target.value,
                })
              }
            />
          </div>

          <div className="taf-input-group">
            <label>Identificador</label>
            <input
              type="text"
              value={tafData.identificador || ""}
              onChange={(e) => handleChange("identificador", e.target.value)}
            />
          </div>
        </div>

        <div className="taf-form-row">
          <div className="taf-input-group">
            <label>IND</label>
            <input
              type="text"
              value={ficha.nrInd || ""}
              onChange={(e) =>
                onUpdate({
                  nrInd: e.target.value,
                })
              }
            />
          </div>

          <div className="taf-input-group">
            <label>Tag do Produto</label>
            <input
              type="text"
              value={ficha.tag || ""}
              onChange={(e) =>
                onUpdate({
                  tag: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="taf-form-row">
          <div className="taf-input-group">
            <label>Tensão</label>
            <input
              type="text"
              value={tafData.tensao || ""}
              onChange={(e) => handleChange("tensao", e.target.value)}
            />
          </div>

          <div className="taf-input-group">
            <label>Obra</label>
            <input
              type="text"
              value={ficha.obra || ""}
              onChange={(e) =>
                onUpdate({
                  obra: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="taf-form-row">
          <div className="taf-input-group">
            <label>Cubículo</label>
            <input
              type="text"
              value={tafData.cubiculo || ""}
              onChange={(e) => handleChange("cubiculo", e.target.value)}
            />
          </div>

          <div className="taf-input-group">
            <label>Cliente</label>
            <input
              type="text"
              value={ficha.cliente || ""}
              onChange={(e) =>
                onUpdate({
                  cliente: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="taf-form-row">
          <div className="taf-input-group">
            <label>Testadores</label>
            <input
              type="text"
              value={tafData.testadores || ""}
              onChange={(e) => handleChange("testadores", e.target.value)}
            />
          </div>

          <div className="taf-input-group">
            <label>Data do Teste</label>
            <input
              type="date"
              value={tafData.dataTeste || ""}
              onChange={(e) => handleChange("dataTeste", e.target.value)}
            />
          </div>
        </div>

        <div className="taf-form-row">
          <div className="taf-input-group">
            <label>Prazo de Entrega</label>
            <input
              type="date"
              value={tafData.prazoEntrega || ""}
              onChange={(e) => handleChange("prazoEntrega", e.target.value)}
            />
          </div>

          <div className="taf-input-group">
            <label>Quem fez a Proposta</label>
            <input
              type="text"
              value={tafData.quemFezProposta || ""}
              onChange={(e) => handleChange("quemFezProposta", e.target.value)}
            />
          </div>
        </div>

        <div className="taf-form-row">
          <div className="taf-input-group">
            <label>Data de Fechamento da Proposta</label>
            <input
              type="date"
              value={tafData.dataFechamentoProposta || ""}
              onChange={(e) =>
                handleChange("dataFechamentoProposta", e.target.value)
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
