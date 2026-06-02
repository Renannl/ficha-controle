export default function ConsideracoesHeaderFields({ ficha, onUpdateHeader }) {
  return (
    <div className="consideracoes-header-fields">
      <div className="field">
        <label>Nome do Equipamento / Título</label>

        <input
          className="consideracoes-input"
          type="text"
          value={ficha.nomeEquipamento || ""}
          onChange={(e) => onUpdateHeader("nomeEquipamento", e.target.value)}
          placeholder="Ex: Transformador T1"
        />
      </div>

      <div className="field">
        <label>Cliente (Referência)</label>

        <input
          className="consideracoes-input"
          type="text"
          value={ficha.cliente || ""}
          onChange={(e) => onUpdateHeader("cliente", e.target.value)}
          placeholder="Ex: ADCOS"
        />
      </div>
    </div>
  );
}
