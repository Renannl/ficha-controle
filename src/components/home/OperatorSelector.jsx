import { UserPlus } from "lucide-react";

export default function OperatorSelector({
  ficha,
  operadores = [],
  listaUsuarios = [],
  user,
  activeDropdownFichaId,
  setActiveDropdownFichaId,
  onToggleOperador,
}) {
  return (
    <div style={{ position: "relative" }}>
      <button
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "50%",
          border: "1px dashed var(--text-secondary)",
          background: "transparent",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          outline: "none",
        }}
        onClick={(e) => {
          e.stopPropagation();

          setActiveDropdownFichaId(
            activeDropdownFichaId === ficha.dbId ? null : ficha.dbId,
          );
        }}
        title="Vincular Operadores"
      >
        <UserPlus size={13} />
      </button>

      {activeDropdownFichaId === ficha.dbId && (
        <div
          className="animate-scaleIn"
          style={{
            position: "absolute",
            right: 0,
            top: "30px",
            width: "180px",
            maxHeight: "160px",
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xs)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 99,
            overflowY: "auto",
            padding: "4px 0",
          }}
        >
          <div
            style={{
              padding: "4px 10px",
              fontSize: "10px",
              color: "var(--text-secondary)",
              fontWeight: "bold",
              borderBottom: "1px solid var(--border)",
              textTransform: "uppercase",
            }}
          >
            Escalar Equipe
          </div>

          {listaUsuarios
            .filter(
              (u) => u.nome !== ficha.criadoPor && u.username !== "master",
            )
            .map((u) => {
              const ativo = operadores.some(
                (op) => op.id === u.id || op.username === u.username,
              );

              return (
                <button
                  key={u.id}
                  onClick={(e) => onToggleOperador(e, ficha, u)}
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    fontSize: "12px",
                    textAlign: "left",
                    background: ativo ? "var(--blue-glow)" : "transparent",
                    color: ativo
                      ? "var(--blue-primary)"
                      : "var(--text-secondary)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {u.nome || u.username}
                  </span>

                  {ativo && <span style={{ fontSize: "9px" }}>🟢</span>}
                </button>
              );
            })}

          {listaUsuarios.length === 0 && (
            <div
              style={{
                padding: "6px 10px",
                fontSize: "11px",
                color: "var(--text-secondary)",
                fontStyle: "italic",
              }}
            >
              Sem usuários carregados
            </div>
          )}
        </div>
      )}
    </div>
  );
}
