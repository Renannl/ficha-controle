export default function DashboardTableRow({ ficha, user, onApprove }) {
  return (
    <tr key={ficha.id} style={{ borderBottom: "1px solid var(--border)" }}>
      <td
        style={{
          padding: "10px",
          fontFamily: "monospace",
          fontSize: "11px",
          color: "var(--text-muted)",
        }}
      >
        {ficha.id.slice(0, 8)}
      </td>
      <td style={{ padding: "10px", fontWeight: 600 }}>{ficha.numeroInd}</td>
      <td style={{ padding: "10px" }}>{ficha.nome}</td>
      <td style={{ padding: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              flex: 1,
              background: "var(--border-light)",
              height: "6px",
              borderRadius: "3px",
            }}
          >
            <div
              style={{
                width: `${ficha.pct}%`,
                background: ficha.pct === 100 ? "var(--green)" : "var(--amber)",
                height: "100%",
                borderRadius: "3px",
              }}
            />
          </div>
          <span style={{ fontSize: "12px" }}>
            {ficha.done}/{ficha.total}
          </span>
        </div>
      </td>
      <td style={{ padding: "10px" }}>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: 600,

            background:
              ficha.status === "approved"
                ? "var(--green)"
                : ficha.status === "waiting"
                  ? "var(--amber)"
                  : ficha.status === "done"
                    ? "var(--blue)"
                    : ficha.status === "progress"
                      ? "var(--amber)"
                      : ficha.status === "rejected"
                        ? "var(--red)"
                        : "var(--bg-secondary)",

            color: ficha.status === "empty" ? "var(--text-main)" : "#fff",
          }}
        >
          {ficha.status === "approved"
            ? "APROVADA"
            : ficha.status === "waiting"
              ? "AGUARDANDO"
              : ficha.status === "done"
                ? "PREENCHIDA"
                : ficha.status === "progress"
                  ? "EM ANDAMENTO"
                  : ficha.status === "rejected"
                    ? "REPROVADA"
                    : "NOVA"}
        </span>
      </td>
      <td style={{ padding: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 600,
              background:
                ficha.statusAprovacao === "aprovado"
                  ? "var(--green)"
                  : ficha.statusAprovacao === "reprovado"
                    ? "var(--red)"
                    : ficha.statusAprovacao === "aguardando"
                      ? "var(--amber)"
                      : "transparent",
              color:
                ficha.statusAprovacao === "aprovado" ||
                ficha.statusAprovacao === "reprovado"
                  ? "#fff"
                  : ficha.statusAprovacao === "aguardando"
                    ? "#000"
                    : "var(--text-muted)",
            }}
          >
            {ficha.statusAprovacao === "aprovado"
              ? "APROVADO"
              : ficha.statusAprovacao === "reprovado"
                ? "REPROVADO"
                : ficha.statusAprovacao === "aguardando"
                  ? "AGUARDANDO APROVAÇÃO"
                  : "—"}
          </span>
          {ficha.statusAprovacao === "aguardando" &&
            user?.permissoes?.includes("aprovar") && (
              <button
                onClick={() => onApprove(ficha.id, "aprovado")}
                style={{
                  fontSize: "14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                title="Aprovar"
              >
                ✅
              </button>
            )}
          {ficha.statusAprovacao === "aguardando" &&
            user?.permissoes?.includes("rejeitar") && (
              <button
                onClick={() => onApprove(ficha.id, "reprovado")}
                style={{
                  fontSize: "14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                title="Rejeitar"
              >
                ❌
              </button>
            )}
        </div>
      </td>
    </tr>
  );
}
