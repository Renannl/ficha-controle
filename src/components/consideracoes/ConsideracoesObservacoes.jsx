export default function ConsideracoesObservacoes({
  observacoes,
  onUpdateHeader,
}) {
  return (
    <div className="consideracoes-observacoes">
      <label>Observações (Também aparece na capa)</label>

      <textarea
        value={observacoes || ""}
        onChange={(e) => onUpdateHeader("observacoes", e.target.value)}
        rows={4}
        className="consideracoes-textarea"
        placeholder="Anotações gerais..."
      />
    </div>
  );
}
