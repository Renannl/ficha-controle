export default function InfoEquipmentSection({
  ficha,
  handle,
  clienteTravado,
}) {
  return (
    <div className="card mb-3">
      <div className="section-header">
        <div className="section-icon">⚙️</div>
        <div>
          <h2>Dados do Equipamento</h2>
          <p>Identificação e localização</p>
        </div>
      </div>

      <div className="form-grid gap-3">
        <div className="field">
          <label>Nome do Equipamento</label>
          <input
            value={ficha.nomeEquipamento}
            onChange={handle("nomeEquipamento")}
            placeholder="Ex: Quadro de Transferência Automática"
          />
        </div>

        <div className="form-grid form-grid-2">
          <div className="field">
            <label>Cliente</label>
            <input
              value={clienteTravado}
              readOnly
              disabled
              title="Definido automaticamente pela coleção vinculada"
              style={{ cursor: "not-allowed", opacity: 0.75 }}
            />
          </div>
          <div className="field">
            <label>QTD</label>
            <input value={ficha.qtd} onChange={handle("qtd")} placeholder="1" />
          </div>
        </div>

        <div className="form-grid form-grid-2">
          <div className="field">
            <label>Obra</label>
            <input
              value={ficha.obra}
              onChange={handle("obra")}
              placeholder="UVB Marca"
            />
          </div>

          <div className="field">
            <label>TAG</label>
            <input
              value={ficha.tag}
              onChange={handle("tag")}
              placeholder="QTA"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
