export default function NewFichaMenu({
  show,
  onClose,
  onCreate,
}) {
  if (!show) return null;

  const criar = () => {
    const cliente = prompt("Cliente");

    if (!cliente) return;

    const codigo = prompt("Código da proposta");

    if (!codigo) return;

    const descricao = prompt("Descrição da proposta");

    onCreate({
      cliente,
      codigo_proposta: codigo,
      descricao,
    });
  };

  return (
    <div className="new-ficha-overlay" onClick={onClose}>
      <div
        className="new-ficha-menu"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="new-ficha-menu-header">
          <h3>Nova Proposta</h3>
          <p>Criar coleção de fichas</p>
        </div>

        <button
          className="new-ficha-opt-btn"
          onClick={criar}
        >
          Criar Proposta
        </button>

        <button
          className="btn btn-ghost w-full mt-3"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}