import { useState } from "react";
import {
  FolderPlus,
  Camera,
  ClipboardList,
  Image,
  X,
  Zap,
  Upload,
  ArrowLeft,
} from "lucide-react";
import { ImportarColecaoExcel } from "../excel/ImportarColecaoExcel";

export default function NewFichaMenu({
  show,
  onClose,
  onCreate,
  onCreateFicha,
  mode = "colecoes",
  user,
  onColecaoImportada,
  fichasDaColecao = [],
}) {
  const [etapa, setEtapa] = useState("menu"); // "menu" | "selecionar-producao"

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

  // Fichas de produção disponíveis na coleção atual
  const fichasProducao = fichasDaColecao.filter(
    (f) => String(f.operacao) === "10",
  );

  const handleClickTaf = () => {
    if (fichasProducao.length === 0) {
      alert(
        "Nenhuma ficha de produção encontrada nesta coleção. Crie uma ficha de produção antes de criar a TAF.",
      );
      return;
    }
    setEtapa("selecionar-producao");
  };

  const handleSelecionarProducao = (ficha) => {
    onCreateFicha("taf", ficha);
    setEtapa("menu");
  };

  const handleClose = () => {
    setEtapa("menu");
    onClose();
  };

  return (
    <div className="new-ficha-overlay" onClick={handleClose}>
      <div className="new-ficha-menu" onClick={(e) => e.stopPropagation()}>
        {/* ── HEADER ── */}
        <div className="new-ficha-menu-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {etapa === "selecionar-producao" && (
              <button
                className="new-ficha-close-btn"
                onClick={() => setEtapa("menu")}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h3>
                {etapa === "selecionar-producao"
                  ? "Vincular Ficha TAF"
                  : mode === "fichas"
                    ? "Nova Ficha"
                    : "Nova Proposta"}
              </h3>
              <p>
                {etapa === "selecionar-producao"
                  ? "Escolha a ficha de produção"
                  : mode === "fichas"
                    ? "Escolha o tipo de ficha"
                    : "Criar coleção de fichas"}
              </p>
            </div>
          </div>
          <button className="new-ficha-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* ── ETAPA: SELECIONAR FICHA DE PRODUÇÃO ── */}
        {etapa === "selecionar-producao" && (
          <div className="new-ficha-options">
            {fichasProducao.map((f) => (
              <button
                key={f.dbId}
                className="new-ficha-opt-btn"
                onClick={() => handleSelecionarProducao(f)}
              >
                <div className="new-ficha-opt-icon new-ficha-opt-icon--prod">
                  <ClipboardList size={22} />
                </div>
                <div className="new-ficha-opt-info">
                  <span className="new-ficha-opt-title">
                    {f.codigo} — IND {f.numeroInd}
                  </span>
                  <span className="new-ficha-opt-desc">
                    {f.nomeEquipamento || f.obra || "Sem descrição"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── OPÇÕES DENTRO DE COLEÇÃO ── */}
        {etapa === "menu" && mode === "fichas" && (
          <div className="new-ficha-options">
            <button className="new-ficha-opt-btn" onClick={handleClickTaf}>
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
        )}

        {/* ── OPÇÃO FORA DE COLEÇÃO ── */}
        {etapa === "menu" && mode !== "fichas" && (
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

            <ImportarColecaoExcel
              onImportado={(resultado) => {
                onColecaoImportada?.(resultado);
                handleClose();
              }}
            >
              {({ onClick, carregando }) => (
                <button
                  className="new-ficha-opt-btn"
                  onClick={onClick}
                  disabled={carregando}
                >
                  <div className="new-ficha-opt-icon new-ficha-opt-icon--importar">
                    <Upload size={22} />
                  </div>
                  <div className="new-ficha-opt-info">
                    <span className="new-ficha-opt-title">
                      {carregando ? "Importando..." : "Importar Coleção"}
                    </span>
                    <span className="new-ficha-opt-desc">
                      Criar a partir de planilha Excel
                    </span>
                  </div>
                </button>
              )}
            </ImportarColecaoExcel>
          </div>
        )}

        <button className="btn btn-ghost w-full mt-3" onClick={handleClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
