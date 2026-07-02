import { FolderPlus, Camera, ClipboardList, Image, X, Zap } from "lucide-react";

export default function NewFichaMenu({
  show,
  onClose,
  onCreate,
  onCreateFicha,
  mode = "colecoes",
  user,
}) {
  if (!show) return null;

  const handleCriarColecao = () => {
    const cliente = prompt("Cliente");
    if (!cliente) return;
    const descricao = prompt("Descrição da proposta");
    onCreate({
      cliente,
      descricao,
      criado_por: user?.email || user?.nome || "desconhecido",
    });
  };

  return (
    <div className="new-ficha-overlay" onClick={onClose}>
      <div className="new-ficha-menu" onClick={(e) => e.stopPropagation()}>
        {/* ── HEADER ── */}
        <div className="new-ficha-menu-header">
          <div>
            <h3>{mode === "fichas" ? "Nova Ficha" : "Nova Proposta"}</h3>
            <p>
              {mode === "fichas"
                ? "Escolha o tipo de ficha"
                : "Criar coleção de fichas"}
            </p>
          </div>
          <button className="new-ficha-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* ── OPÇÕES DENTRO DE COLEÇÃO ── */}
        {mode === "fichas" ? (
          <div className="new-ficha-options">
            <button
              className="new-ficha-opt-btn"
              onClick={() => onCreateFicha("taf")}
            >
              <div className="new-ficha-opt-icon new-ficha-opt-icon--taf">
                <Zap size={22} />
              </div>
              <div className="new-ficha-opt-info">
                <span className="new-ficha-opt-title">Ficha TAF</span>
                <span className="new-ficha-opt-desc">
                  Energização e testes elétricos
                </span>
              </div>
            </button>

            <button
              className="new-ficha-opt-btn"
              onClick={() => onCreateFicha("producao")}
            >
              <div className="new-ficha-opt-icon new-ficha-opt-icon--prod">
                <ClipboardList size={22} />
              </div>
              <div className="new-ficha-opt-info">
                <span className="new-ficha-opt-title">Ficha de Produção</span>
                <span className="new-ficha-opt-desc">
                  Planejamento e execução
                </span>
              </div>
            </button>

            {/* ── NOVO: Relatório Fotográfico ── */}
            <button
              className="new-ficha-opt-btn"
              onClick={() => onCreateFicha("fotos")}
            >
              <div className="new-ficha-opt-icon new-ficha-opt-icon--fotos">
                <Image size={22} />
              </div>
              <div className="new-ficha-opt-info">
                <span className="new-ficha-opt-title">
                  Relatório Fotográfico
                </span>
                <span className="new-ficha-opt-desc">
                  Registro de evidências em fotos
                </span>
              </div>
            </button>
          </div>
        ) : (
          /* ── OPÇÃO FORA DE COLEÇÃO ── */
          <div className="new-ficha-options">
            <button className="new-ficha-opt-btn" onClick={handleCriarColecao}>
              <div className="new-ficha-opt-icon new-ficha-opt-icon--colecao">
                <Camera size={22} />
              </div>
              <div className="new-ficha-opt-info">
                <span className="new-ficha-opt-title">Criar Proposta</span>
                <span className="new-ficha-opt-desc">
                  Nova coleção de fichas
                </span>
              </div>
            </button>
          </div>
        )}

        <button className="btn btn-ghost w-full mt-3" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
