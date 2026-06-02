export default function HeaderApprovalActions({
  ficha,
  user,
  onApprove,
}) {
  if (ficha.status !== "finalizada") return null;

  return (
    <div className="approval-actions">
      {ficha.statusAprovacao === "aprovado" && (
        <span className="approval-approved">
          APROVADO ✓
        </span>
      )}

      {ficha.statusAprovacao === "reprovado" && (
        <span className="approval-rejected">
          REPROVADO ✗
        </span>
      )}

      {user?.permissoes?.includes("aprovar") &&
        ficha.statusAprovacao !== "aprovado" && (
          <button
            onClick={() => onApprove("aprovado")}
            className="btn btn-approve"
          >
            Aprovar
          </button>
        )}

      {user?.permissoes?.includes("rejeitar") &&
        ficha.statusAprovacao !== "reprovado" && (
          <button
            onClick={() => onApprove("reprovado")}
            className="btn btn-reject"
          >
            Rejeitar
          </button>
        )}
    </div>
  );
}