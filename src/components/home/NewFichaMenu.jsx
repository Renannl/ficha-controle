import { ClipboardList, Zap, Camera } from "lucide-react";

export default function NewFichaMenu({
  show,
  onClose,
  availableOps,
  onCreate,
}) {
  if (!show) return null;

  return (
    <div className="new-ficha-overlay animate-fadeIn" onClick={onClose}>
      <div
        className="new-ficha-menu animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="new-ficha-menu-header">
          <h3>Selecione o Modelo</h3>
          <p>Escolha qual ficha deseja iniciar agora</p>
        </div>

        <div className="new-ficha-options">
          {availableOps.map((op) => (
            <button
              key={op.codigo}
              className="new-ficha-opt-btn"
              onClick={() => onCreate(op.codigo)}
            >
              <div className="opt-icon">
                {op.codigo === "50" ? (
                  <Zap size={22} />
                ) : op.codigo === "80" ? (
                  <Camera size={22} />
                ) : (
                  <ClipboardList size={22} />
                )}
              </div>

              <div className="opt-text">
                <div className="opt-title">{op.nome}</div>
                <div className="opt-desc">{op.objetivo}</div>
              </div>
            </button>
          ))}
        </div>

        <button className="btn btn-ghost w-full mt-3" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
