import { getFichaStatus, getProgressPct } from "../../utils/fichaStatus";
import { OPERACOES } from "../../data/fichaTemplate";
import { canDeleteFicha, canGeneratePdf } from "../../utils/hasPermission";
import {
  User,
  Tag,
  Trash2,
  AlertCircle,
  Clock3,
  CheckCircle2,
  FileText,
  Circle,
  FileInputIcon,
} from "lucide-react";
import { FaFilePdf } from "react-icons/fa";
import OperatorSelector from "./OperatorSelector";

export default function FichaCard({
  ficha,
  index,
  selected,
  selectionOrder,
  onToggleSelection,
  user,
  listaUsuarios,
  onOpen,
  onDelete,
  onToggleOperador,
  podeGerenciarOperadores,
  activeDropdownFichaId,
  setActiveDropdownFichaId,
}) {
  const status = getFichaStatus(ficha);
  const pct = getProgressPct(ficha);
  const operadores = ficha.operadores || []; // Garante o array de operadores ativos no card

  return (
    <div
      key={ficha.id}
      className={`ficha-card status-${status}`}
      style={{
        animationDelay: `${index * 0.05}s`,
        zIndex: activeDropdownFichaId === ficha.id ? 999 : 1,
      }}
      onClick={() => onOpen(ficha.id)}
    >
      <div className="ficha-card-top">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ficha-card-title">
            {ficha.nomeEquipamento || "Sem nome"}
          </div>

          <div className="ficha-card-sub">
            <strong>{ficha.nrInd || "—"}</strong> ·{" "}
            {OPERACOES[ficha.operacao]?.nome || "—"} · {ficha.cliente || "—"}
          </div>

          <div className="ficha-card-meta">
            <span className="ficha-meta-user">
              <User size={14} />
              {ficha.criadoPor || ficha.userId || "-"}
            </span>

            <span className="ficha-meta-code">
              <Tag size={14} />
              {ficha.codigo || "-"}
            </span>
            {canGeneratePdf(user) && (
              <div className="pdf-selector">
                <div
                  className="pdf-badge"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelection(ficha.id);
                  }}
                >
                  <FaFilePdf className="pdf-icon" />

                  <span className="pdf-label">PDF</span>
                  <label className="ficha-checkbox">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleSelection(ficha.id)}
                    />

                    <span
                      className="checkmark"
                      data-order={selected ? selectionOrder : ""}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
        {canDeleteFicha(user) && (
          <button
            className="delete-btn"
            onClick={(e) => onDelete(e, ficha.id)}
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* ─── MODIFICAÇÃO: AREA DE OPERADORES ATIVOS NO CARD (Entre o topo e a barra de progresso) ─── */}
      <div
        className="ficha-card-operators-section"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "10px",
          marginBottom: "6px",
          paddingTop: "8px",
          borderTop: "1px solid var(--border)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()} // Impede que o clique nesta área abra a ficha inteira
      >
        {/* Lista de Avatares Pilhados */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            overflow: "hidden",
          }}
        >
          {operadores.length === 0 ? (
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                fontStyle: "italic",
              }}
            >
              Nenhum operador atribuído
            </span>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: "4px",
              }}
            >
              {operadores.map((op, idx) => (
                <div
                  key={op.id || idx}
                  title={op.nome}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "var(--blue-accent)",
                    color: "var(--bg-card)",
                    border: "2px solid var(--bg-card)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: "bold",
                    marginLeft: idx === 0 ? 0 : -8,
                    position: "relative",
                    zIndex: operadores.length - idx,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    flexShrink: 0,
                  }}
                >
                  {(op.nome || "?")[0].toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão de Adicionar (+) com Dropdown Absoluto */}
        {podeGerenciarOperadores && (
          <OperatorSelector
            ficha={ficha}
            operadores={operadores}
            listaUsuarios={listaUsuarios}
            user={user}
            activeDropdownFichaId={activeDropdownFichaId}
            setActiveDropdownFichaId={setActiveDropdownFichaId}
            onToggleOperador={onToggleOperador}
          />
        )}
      </div>

      <div className="ficha-card-bottom">
        <div className="flex items-center gap-2">
          {status === "rejected" && (
            <span className="badge badge-red">
              <AlertCircle size={14} />
              Reprovada
            </span>
          )}

          {status === "waiting" && (
            <span className="badge badge-amber">
              <Clock3 size={14} />
              Aguardando análise
            </span>
          )}

          {status === "approved" && (
            <span className="badge badge-green">
              <CheckCircle2 size={14} />
              Aprovada
            </span>
          )}

          {status === "done" && (
            <span className="badge badge-blue">
              <FileText size={14} />
              Preenchida
            </span>
          )}

          {status === "progress" && (
            <span className="badge badge-amber">
              <Clock3 size={14} />
              Em andamento
            </span>
          )}

          {status === "empty" && (
            <span className="badge badge-muted">
              <Circle size={12} />
              Nova
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="progress-bar" style={{ width: 50 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-bold text-blue">{pct}%</span>
        </div>
      </div>
    </div>
  );
}
